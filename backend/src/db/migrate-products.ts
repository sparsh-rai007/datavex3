import { pool } from './connection';

export async function migrateProducts() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running products table migrations...');

    // 1. Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        tagline VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        detailed_description TEXT NOT NULL,
        metric VARCHAR(255) NOT NULL,
        metric_label VARCHAR(255) NOT NULL,
        icon VARCHAR(100) NOT NULL,
        color VARCHAR(255) NOT NULL,
        icon_color VARCHAR(255),
        icon_bg VARCHAR(255),
        glow VARCHAR(255),
        features JSONB NOT NULL DEFAULT '[]',
        tech_stack JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table "products" verified/created');

    // 2. Seed default products if table is empty
    const checkCount = await client.query('SELECT COUNT(*) FROM products');
    const count = parseInt(checkCount.rows[0].count, 10);

    if (count === 0) {
      console.log('🌱 Seeding initial products...');
      const initialProducts = [
        {
          id: 'vexcad',
          name: 'VexCAD',
          category: 'Engineering & Design',
          tagline: '2D to 3D CAD draft conversion engine',
          description: 'Convert architectural drawings, engineering drafts, and 2D blueprints into production-ready 3D CAD files instantly.',
          detailed_description: 'VexCAD is a cutting-edge spatial computing assistant that leverages deep learning to translate 2D vector layouts and structural line drawings into detailed 3D volumetric assets. Engineered for developers, civil architects, and manufacturing plants to compress modeling lifecycles.',
          metric: '85%',
          metric_label: 'Reduction in CAD Modeling Time',
          icon: 'Layers',
          color: 'from-blue-500 via-blue-600 to-indigo-700',
          icon_color: 'text-blue-600',
          icon_bg: 'bg-blue-50 border-blue-100',
          glow: 'shadow-blue-500/10 hover:shadow-blue-500/20 border-blue-100',
          features: [
            'Multi-format vector ingestion (DWG, DXF, PDF, SVG)',
            'Automated polygon mesh rendering and topological checks',
            'Precision scale and volumetric margin adjustments',
            'One-click exporting to STL, OBJ, STEP, and IGES file types'
          ],
          tech_stack: ['Three.js', 'WebGL', 'C++', 'PyTorch']
        },
        {
          id: 'credivex',
          name: 'CrediVex',
          category: 'FinTech & Security',
          tagline: 'Credit Card Information System',
          description: 'Comprehensive banking intelligence suite for card transaction audits, credit scoring, and secure ledgering.',
          detailed_description: 'CrediVex is an enterprise core credit card information registry and balance tracking system. Providing bank-level encryption alongside transaction audit trails, real-time interest calculation pipelines, and multi-tenant ledger synchronization.',
          metric: '99.999%',
          metric_label: 'Transaction Ledger Accuracy',
          icon: 'CreditCard',
          color: 'from-cyan-500 via-cyan-600 to-blue-700',
          icon_color: 'text-cyan-600',
          icon_bg: 'bg-cyan-50 border-cyan-100',
          glow: 'shadow-cyan-500/10 hover:shadow-cyan-500/20 border-cyan-100',
          features: [
            'PCI-DSS compliance grade audit trails and vault databases',
            'Real-time spending pattern mapping and credit scoring analytics',
            'Dunning alert pipelines & automated dispute reconciliation',
            'High-throughput banking API connections & batch processors'
          ],
          tech_stack: ['Node.js', 'PostgreSQL', 'Redis', 'Kubernetes']
        },
        {
          id: 'cureconnect',
          name: 'CureConnect',
          category: 'Healthcare & Logistics',
          tagline: 'Medical Tourism Platform',
          description: 'Global medical matchmaking, secure records translation, travel logistics, and clinic booking hub.',
          detailed_description: 'CureConnect acts as a digital bridge between international medical facilities and global patients. The system coordinates treatment quotations, electronic health records (EHR) exchanges, flight and hotel reservations, and post-op rehabilitation routines.',
          metric: '42%',
          metric_label: 'Procedure Cost Deflection',
          icon: 'HeartPulse',
          color: 'from-emerald-500 via-teal-600 to-emerald-700',
          icon_color: 'text-emerald-600',
          icon_bg: 'bg-emerald-50 border-emerald-100',
          glow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20 border-emerald-100',
          features: [
            'Verified global directories of clinics, hospitals, and surgeons',
            'HIPAA-compliant encrypted medical history and EHR portals',
            'Integrated logistics hub for hotel, transport, and flights scheduling',
            'Real-time translation and multi-currency billing engines'
          ],
          tech_stack: ['Next.js', 'FastAPI', 'HIPAA Cloud API', 'Twilio']
        },
        {
          id: 'mysticroutes',
          name: 'MysticRoutes',
          category: 'Tourism & Travel',
          tagline: 'Spiritual & Sacred Tourism Platform',
          description: 'Discover, plan, and book seamless spiritual pilgrim circuits, local guide packages, and wellness retreats.',
          detailed_description: 'MysticRoutes brings structure, safety, and deep contextual guidance to pilgrim travelers. Meticulously cataloging sacred places of worship, booking temple-managed accommodations, hiring certified guides, and predicting crowd flows.',
          metric: '15k+',
          metric_label: 'Sacred Locations Cataloged',
          icon: 'Compass',
          color: 'from-amber-500 via-amber-600 to-orange-700',
          icon_color: 'text-amber-600',
          icon_bg: 'bg-amber-50 border-amber-100',
          glow: 'shadow-amber-500/10 hover:shadow-amber-500/20 border-amber-100',
          features: [
            'Customized spiritual itinerary planners with guide assignments',
            'Temple and ashram booking directories with direct ledger sync',
            'Real-time safety, queue capacity, and local festival alerts',
            'Offline maps, language guides, and emergency travel assistance'
          ],
          tech_stack: ['GraphQL', 'PostgreSQL', 'Google Maps API', 'React Native']
        },
        {
          id: 'lexos',
          name: 'LexOS',
          category: 'Enterprise & Compliance',
          tagline: 'Legal OS for Organisations',
          description: 'Autonomous contract audits, dynamic corporate governance playbooks, and litigation milestone trackers.',
          detailed_description: 'LexOS is a comprehensive digital legal framework that empowers operations teams. Automatically scanning corporate paperwork, flagging unfavorable contractual clauses, drafting templates, and establishing clear audit trails for board regulatory reviews.',
          metric: '94%',
          metric_label: 'Reduction in Legal Audits Cost',
          icon: 'Scale',
          color: 'from-slate-700 via-slate-800 to-zinc-900',
          icon_color: 'text-slate-700',
          icon_bg: 'bg-slate-50 border-slate-200',
          glow: 'shadow-slate-500/10 hover:shadow-slate-500/20 border-slate-200',
          features: [
            'AI semantic parser to detect hidden legal and financial liabilities',
            'Dynamic corporate policy repository and compliance checking',
            'Auto-drafting contracts and custom legal clauses from library templates',
            'Real-time calendar updates for pending court files or corporate filings'
          ],
          tech_stack: ['Llama 3 70B', 'FastAPI', 'Docker', 'Python']
        },
        {
          id: 'taskvera',
          name: 'TaskVera',
          category: 'Productivity & SaaS',
          tagline: 'Project Management Core',
          description: 'Streamline high-velocity developer sprints, roadmap dependencies, and resource capacity scoring.',
          detailed_description: 'TaskVera is an elegant, high-performance sprint management tool tailored for fast-paced developer environments. Built to eliminate status update overhead, offering real-time task mapping, Git-driven boards, and predictive delivery metrics.',
          metric: '31%',
          metric_label: 'Increase in Sprint Velocity',
          icon: 'CheckSquare',
          color: 'from-violet-500 via-violet-600 to-purple-800',
          icon_color: 'text-violet-600',
          icon_bg: 'bg-violet-50 border-violet-100',
          glow: 'shadow-violet-500/10 hover:shadow-violet-500/20 border-violet-100',
          features: [
            'Interactive drag-and-drop sprint boards with automated subtask linkages',
            'Git hook integrations linking pull requests straight to workflow nodes',
            'Auto-generated weekly status memos and capacity estimation engines',
            'Fast, developer-focused keyboard shortcuts and dark-mode themes'
          ],
          tech_stack: ['React', 'Tailwind CSS', 'WebSockets', 'Express']
        },
        {
          id: 'meetingmind',
          name: 'MeetingMind',
          category: 'AI & Collaboration',
          tagline: 'AI Speech To Text Scribe',
          description: 'Autonomous multi-speaker transcription, real-time translations, and automated task assignments.',
          detailed_description: 'MeetingMind acts as a silent AI workspace assistant. Connecting directly to digital huddles or microphone inputs to generate diarized transcriptions, extract executive task lists, and push meeting logs straight to communication tools.',
          metric: '98.7%',
          metric_label: 'Multi-Speaker Audio Accuracy',
          icon: 'Mic',
          color: 'from-purple-500 via-purple-600 to-pink-700',
          icon_color: 'text-purple-600',
          icon_bg: 'bg-purple-50 border-purple-100',
          glow: 'shadow-purple-500/10 hover:shadow-purple-500/20 border-purple-100',
          features: [
            'Voice-fingerprinting diarization separating up to 12 distinct speakers',
            'Semantic keyword taggers & executive brief generator modules',
            'Automated task pushes to Slack channels and Jira sprint lists',
            'End-to-end encryption vaults for secure, confidential session storing'
          ],
          tech_stack: ['Whisper API', 'PyTorch', 'AWS S3', 'FastAPI']
        },
        {
          id: 'vexhr',
          name: 'VexHR',
          category: 'Enterprise & HRMS',
          tagline: 'Human Resource Management System',
          description: 'Manage workforce directories, automated bank deposits, tax calculations, and leaf request flows.',
          detailed_description: 'VexHR brings peace of mind to corporate HR departments. It centralizes talent files, computes regional tax deductions, routes leave requests, audit benefit structures, and processes high-scale corporate payroll in a single dashboard.',
          metric: '0',
          metric_label: 'Payroll Processing Overruns',
          icon: 'Users',
          color: 'from-indigo-600 via-indigo-700 to-blue-800',
          icon_color: 'text-indigo-600',
          icon_bg: 'bg-indigo-50 border-indigo-100',
          glow: 'shadow-indigo-500/10 hover:shadow-indigo-500/20 border-indigo-100',
          features: [
            'Visual organizational chart engines with dynamic reports routing',
            'Automated regional tax compliance & direct-deposit integrations',
            'Self-service employee request hubs for payslips and leaves tracking',
            'Dynamic workforce attendance logs & visual appraisal grids'
          ],
          tech_stack: ['Next.js', 'PostgreSQL', 'BullMQ', 'Node.js']
        },
        {
          id: 'kaasvex',
          name: 'KaasVex',
          category: 'FinTech & Finance',
          tagline: 'Billing & Invoicing Software',
          description: 'Scale subscription tiers, calculate GST/VAT, handle card retries, and track metrics in one place.',
          detailed_description: 'KaasVex is a versatile, high-scale billing processor designed for subscription SaaS platforms and transaction marketplaces. Managing recurring checkouts, complex local tax configurations (like GST/VAT), retry loops, and analytics.',
          metric: '4.8%',
          metric_label: 'Reduction in Subscription Churn',
          icon: 'Calculator',
          color: 'from-rose-500 via-rose-600 to-pink-700',
          icon_color: 'text-rose-600',
          icon_bg: 'bg-rose-50 border-rose-100',
          glow: 'shadow-rose-500/10 hover:shadow-rose-500/20 border-rose-100',
          features: [
            'Automated multi-currency billing and localized invoice generation',
            'Pre-built hosted secure checkout templates & overlays',
            'Smart dunning schedules and retry logic for failed credit card attempts',
            'Real-time MRR, LTV, and churn metric visualization dashboards'
          ],
          tech_stack: ['React', 'FastAPI', 'Stripe API', 'PostgreSQL']
        },
        {
          id: 'hullsync',
          name: 'HullSync',
          category: 'Industrial & Maritime',
          tagline: 'Ship Building Platform',
          description: 'Naval engineering workflows, supply chain material schedules, and automated structural simulations.',
          detailed_description: 'HullSync is an industry-first naval operations pipeline tool. Integrating shipyard supply registers with real-time stress testing, buoyancy simulations, material procurement schedules, and maritime certification logs.',
          metric: '12%',
          metric_label: 'Average Yard Material Savings',
          icon: 'Anchor',
          color: 'from-teal-500 via-teal-600 to-emerald-700',
          icon_color: 'text-teal-600',
          icon_bg: 'bg-teal-50 border-teal-100',
          glow: 'shadow-teal-500/10 hover:shadow-teal-500/20 border-teal-100',
          features: [
            'Automated center of gravity and hull structural stress simulations',
            'Heavy materials supply chain schedule planners & procurement registries',
            'Pre-integrated bidding portals linking yard requests with steel vendors',
            'Detailed regulatory blueprints tracking compliance logs for major ship codes'
          ],
          tech_stack: ['Three.js', 'C++', 'WebAssembly', 'Python']
        }
      ];

      for (const product of initialProducts) {
        await client.query(
          `INSERT INTO products (
            id, name, category, tagline, description, detailed_description, 
            metric, metric_label, icon, color, icon_color, icon_bg, glow, features, tech_stack
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            product.id,
            product.name,
            product.category,
            product.tagline,
            product.description,
            product.detailed_description,
            product.metric,
            product.metric_label,
            product.icon,
            product.color,
            product.icon_color,
            product.icon_bg,
            product.glow,
            JSON.stringify(product.features),
            JSON.stringify(product.tech_stack)
          ]
        );
      }
      console.log('🌱 Seeded 10 default products successfully!');
    } else {
      console.log('ℹ️ Products table already has records, skipping seed.');
    }
  } catch (error) {
    console.error('❌ Migration failed for products:', error);
    throw error;
  } finally {
    client.release();
  }
}
