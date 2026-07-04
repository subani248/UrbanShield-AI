import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, UserCheck, Trash2, Mail, Calendar } from 'lucide-react';
import { userAPI } from '../../services/api';
import { PageLoader } from '../../components/ui/Loading';
import ToastContainer from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { formatDate, capitalize } from '../../utils/helpers';
import { cn } from '../../utils/cn';

export default function Users() {
  const { toasts, addToast, removeToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await userAPI.getAll(params);
      setUsers(res.data.users);
    } catch { addToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await userAPI.deleteUser(id); addToast('User deleted', 'success'); fetchUsers(); }
    catch { addToast('Failed to delete', 'error'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Users</h1>
          <p className="text-gray-400 text-sm mt-1">Manage system users and officers</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10 !py-2 text-sm" placeholder="Search by name or email..." />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field !py-2 text-sm max-w-[150px]">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="citizen">Citizen</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Joined</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-sm font-bold">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{u.email}</td>
                  <td className="p-4">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border',
                      u.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-green-500/20 text-green-400 border-green-500/30'
                    )}>{capitalize(u.role)}</span>
                  </td>
                  <td className="p-4">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border',
                      u.isApproved ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    )}>{u.isApproved ? 'Approved' : 'Pending'}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{formatDate(u.createdAt)}</td>
                    <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleDelete(u._id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete User">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
