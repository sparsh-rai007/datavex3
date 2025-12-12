import axios from 'axios';

type CRMProvider = 'hubspot' | 'pipedrive' | 'none';

export interface CRMLeadPayload {
  id?: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  phone?: string | null;
  source?: string | null;
  notes?: string | null;
  status?: string | null;
  score?: number | null;
}

export interface CRMJobPayload {
  id?: string;
  title: string;
  department?: string | null;
  location?: string | null;
  status?: string | null;
  type?: string | null;
  description?: string | null;
}

class CRMService {
  private provider: CRMProvider;
  private hubspotToken?: string;
  private pipedriveToken?: string;
  private pipedriveBaseUrl: string;

  constructor() {
    this.provider = (process.env.CRM_PROVIDER as CRMProvider) || 'none';
    this.hubspotToken = process.env.HUBSPOT_PRIVATE_TOKEN || process.env.HUBSPOT_API_KEY;
    this.pipedriveToken = process.env.PIPEDRIVE_API_TOKEN;
    this.pipedriveBaseUrl = process.env.PIPEDRIVE_BASE_URL || 'https://api.pipedrive.com/v1';
  }

  /**
   * Returns true if CRM integration is configured
   */
  isConfigured(): boolean {
    if (this.provider === 'hubspot') {
      return !!this.hubspotToken && this.hubspotToken !== 'your-hubspot-private-token';
    }
    if (this.provider === 'pipedrive') {
      return !!this.pipedriveToken && this.pipedriveToken !== 'your-pipedrive-api-token';
    }
    return false;
  }

  /**
   * Sync lead/contact data to the configured CRM.
   * This method is resilient and will not throw, instead logging errors.
   */
  async syncLead(lead: CRMLeadPayload): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      switch (this.provider) {
        case 'hubspot':
          await this.syncLeadToHubspot(lead);
          break;
        case 'pipedrive':
          await this.syncLeadToPipedrive(lead);
          break;
        default:
          break;
      }
    } catch (error: any) {
      console.error(`CRM lead sync failed (${this.provider}):`, error.response?.data || error.message);
    }
  }

  /**
   * Sync job posting data to the configured CRM (optional helper).
   */
  async syncJob(job: CRMJobPayload): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      switch (this.provider) {
        case 'hubspot':
          await this.syncJobToHubspot(job);
          break;
        case 'pipedrive':
          await this.syncJobToPipedrive(job);
          break;
        default:
          break;
      }
    } catch (error: any) {
      console.error(`CRM job sync failed (${this.provider}):`, error.response?.data || error.message);
    }
  }

  private async syncLeadToHubspot(lead: CRMLeadPayload) {
    if (!this.hubspotToken) return;

    const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
    const properties: Record<string, any> = {
      email: lead.email,
      firstname: lead.first_name || undefined,
      lastname: lead.last_name || undefined,
      company: lead.company || undefined,
      phone: lead.phone || undefined,
      lifecyclestage: this.mapLeadStatusToLifecycle(lead.status),
      hs_lead_status: lead.status || undefined,
    };

    // Remove undefined fields
    Object.keys(properties).forEach((key) => properties[key] === undefined && delete properties[key]);

    try {
      await axios.post(
        url,
        { properties },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.hubspotToken}`,
          },
          timeout: 15000,
        }
      );
    } catch (error: any) {
      // HubSpot returns 409 when the contact already exists – ignore quietly
      if (error.response?.status !== 409) {
        throw error;
      }
    }
  }

  private async syncLeadToPipedrive(lead: CRMLeadPayload) {
    if (!this.pipedriveToken) return;

    const url = `${this.pipedriveBaseUrl}/persons?api_token=${this.pipedriveToken}`;
    const payload: Record<string, any> = {
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.email,
      email: lead.email,
      phone: lead.phone || undefined,
      org_name: lead.company || undefined,
      visible_to: 3, // Entire company
      label: lead.status || undefined,
    };

    await axios.post(url, payload, { timeout: 15000 });
  }

  private async syncJobToHubspot(job: CRMJobPayload) {
    if (!this.hubspotToken) return;

    const url = 'https://api.hubapi.com/crm/v3/objects/deals';
    const properties: Record<string, any> = {
      dealname: job.title,
      pipeline: process.env.HUBSPOT_JOBS_PIPELINE_ID,
      dealstage: process.env.HUBSPOT_JOBS_STAGE_ID,
      job_department: job.department || undefined,
      job_location: job.location || undefined,
      job_status: job.status || undefined,
      job_type: job.type || undefined,
      description: job.description || undefined,
    };

    Object.keys(properties).forEach((key) => properties[key] === undefined && delete properties[key]);

    await axios.post(
      url,
      { properties },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.hubspotToken}`,
        },
        timeout: 15000,
      }
    );
  }

  private async syncJobToPipedrive(job: CRMJobPayload) {
    if (!this.pipedriveToken) return;

    const url = `${this.pipedriveBaseUrl}/deals?api_token=${this.pipedriveToken}`;
    const payload = {
      title: job.title,
      status: job.status || 'open',
      pipeline_id: process.env.PIPEDRIVE_JOBS_PIPELINE_ID,
      stage_id: process.env.PIPEDRIVE_JOBS_STAGE_ID,
      value: 0,
      visible_to: 3,
      job_department: job.department || undefined,
      job_location: job.location || undefined,
      job_type: job.type || undefined,
    };

    await axios.post(url, payload, { timeout: 15000 });
  }

  private mapLeadStatusToLifecycle(status?: string | null): string | undefined {
    switch (status) {
      case 'new':
        return 'subscriber';
      case 'contacted':
        return 'marketingqualifiedlead';
      case 'qualified':
        return 'salesqualifiedlead';
      case 'converted':
        return 'customer';
      case 'lost':
        return 'other';
      default:
        return undefined;
    }
  }
}

export const crmService = new CRMService();


