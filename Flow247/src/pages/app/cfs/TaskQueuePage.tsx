import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Clock, Container, Plus, Loader2, RefreshCw, Search,
  AlertTriangle, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getCfsTasks, createCfsTask, updateCfsTask,
  type CfsTask
} from '@/lib/xano';

const TASK_TYPES = [
  'CALL_CFS', 'PAY_CHARGES', 'SCHEDULE_PICKUP', 'DOCS_MISSING', 'CUSTOMS_HOLD',
  'FREIGHT_HOLD', 'URGENT_RECOVERY', 'BOOK_TRUCKER', 'RESOLVE_HOLD',
  'VERIFY_APPOINTMENT', 'CONTACT_CUSTOMER', 'OTHER'
];

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'DONE': return 'success' as const;
    case 'IN_PROGRESS': return 'info' as const;
    case 'CANCELLED': return 'secondary' as const;
    default: return 'outline' as const;
  }
};

const getPriorityColor = (priority?: number) => {
  if (!priority) return 'bg-muted/50 text-muted-foreground';
  if (priority >= 4) return 'bg-red-500/20 text-red-500';
  if (priority >= 3) return 'bg-amber-500/20 text-amber-500';
  if (priority >= 2) return 'bg-blue-500/20 text-blue-500';
  return 'bg-muted/50 text-muted-foreground';
};

export default function TaskQueuePage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<CfsTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [newTask, setNewTask] = useState({
    container_number: '',
    task_type: 'SCHEDULE_PICKUP',
    title: '',
    description: '',
    priority: 3,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCfsTasks({
        status: statusFilter || undefined,
        container_number: searchQuery || undefined,
        limit: 50,
      });
      if (res.data) {
        setTasks(Array.isArray(res.data) ? res.data : []);
      } else {
        toast.error(res.error || 'Failed to load tasks');
      }
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!newTask.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setCreating(true);
    try {
      const res = await createCfsTask({
        container_number: newTask.container_number || undefined,
        task_type: newTask.task_type,
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Task created');
        setShowCreateForm(false);
        setNewTask({ container_number: '', task_type: 'SCHEDULE_PICKUP', title: '', description: '', priority: 3 });
        loadData();
      }
    } catch {
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (taskId: number, status: string, note?: string) => {
    try {
      const res = await updateCfsTask(taskId, {
        status,
        ...(note ? { resolution_note: note } : {}),
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Task ${status === 'DONE' ? 'completed' : 'updated'}`);
        loadData();
      }
    } catch {
      toast.error('Failed to update task');
    }
  };

  const openCount = tasks.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Task Queue</h1>
            <p className="text-sm text-muted-foreground">Manage CFS operations tasks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="gradient-primary glow-cyan" size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Open', value: openCount, color: 'text-primary', icon: Clock },
          { label: 'In Progress', value: inProgressCount, color: 'text-blue-500', icon: AlertTriangle },
          { label: 'Done', value: doneCount, color: 'text-green-500', icon: CheckCircle2 },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </p>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-muted-foreground">Title *</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask(t => ({ ...t, title: e.target.value }))}
                placeholder="Task title"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Container #</label>
              <Input
                value={newTask.container_number}
                onChange={(e) => setNewTask(t => ({ ...t, container_number: e.target.value }))}
                placeholder="e.g., FFAU2413670"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Task Type</label>
              <select
                value={newTask.task_type}
                onChange={(e) => setNewTask(t => ({ ...t, task_type: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {TASK_TYPES.map(tt => (
                  <option key={tt} value={tt}>{tt.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Priority (1-5)</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(t => ({ ...t, priority: Number(e.target.value) }))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map(p => (
                  <option key={p} value={p}>{p} - {p >= 4 ? 'High' : p >= 3 ? 'Medium' : 'Low'}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-muted-foreground">Description</label>
              <Input
                value={newTask.description}
                onChange={(e) => setNewTask(t => ({ ...t, description: e.target.value }))}
                placeholder="Optional description"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="gradient-primary" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Task
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by container number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
        <div className="flex gap-2">
          {['', 'OPEN', 'IN_PROGRESS', 'DONE'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? 'gradient-primary' : ''}
            >
              {s ? s.replace(/_/g, ' ') : 'All'}
            </Button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm text-muted-foreground">Create a new task or adjust filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <div
              key={task.id || i}
              className="glass-card rounded-xl p-4 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${getPriorityColor(task.priority)}`}>
                  P{task.priority || '-'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium">{task.title || task.task_type?.replace(/_/g, ' ')}</span>
                    {task.container_number && (
                      <Badge variant="outline" className="text-xs">
                        <Container className="mr-1 h-3 w-3" />
                        {task.container_number}
                      </Badge>
                    )}
                    {task.task_type && (
                      <Badge variant="secondary" className="text-xs">{task.task_type.replace(/_/g, ' ')}</Badge>
                    )}
                    <Badge variant={getStatusBadge(task.status)} className="text-xs">{task.status}</Badge>
                  </div>
                  {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                  {task.notes && <p className="text-xs text-muted-foreground mt-1">Note: {task.notes}</p>}
                  {task.resolution_note && <p className="text-xs text-green-500 mt-1">Resolution: {task.resolution_note}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {task.created_at && new Date(task.created_at).toLocaleDateString()}
                    {task.assigned_name && ` - Assigned: ${task.assigned_name}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {task.status === 'OPEN' && (
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}>
                      Start
                    </Button>
                  )}
                  {(task.status === 'OPEN' || task.status === 'IN_PROGRESS') && (
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(task.id, 'DONE', 'Completed from dashboard')}>
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Done
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
