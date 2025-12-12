'use client';

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'editor' });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const data = await apiClient.getAdminUsers();
    setUsers(data);
  }

  async function createUser() {
    await apiClient.createAdminUser(form);
    setForm({ firstName: '', lastName: '', email: '', password: '', role: 'editor' });
    loadUsers();
  }

  async function deleteUser(id: string) {
    await apiClient.deleteAdminUser(id);
    loadUsers();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Users</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-2">Create New Admin User</h2>

        <div className="grid grid-cols-2 gap-4">
          <input placeholder="First Name" className="border p-2" value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })} />

          <input placeholder="Last Name" className="border p-2" value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })} />

          <input placeholder="Email" className="border p-2" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} />

          <input placeholder="Password" type="password" className="border p-2" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} />

          <select className="border p-2" value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>

          <button className="bg-primary-600 text-white px-4 py-2 rounded"
            onClick={createUser}>
            Create User
          </button>
        </div>
      </div>

      {/* USERS TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.first_name} {u.last_name}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">
                <button className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => deleteUser(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
