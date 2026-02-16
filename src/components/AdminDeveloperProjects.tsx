import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HardHat, Search, MapPin, Eye, Trash2, Building2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeveloperProject {
  id: string;
  title: string;
  project_type: string;
  status: string;
  completion_percentage: number | null;
  city: string | null;
  images: string[] | null;
  price_from: number | null;
  price_to: number | null;
  total_units: number | null;
  available_units: number | null;
  created_at: string;
  user_id: string;
  developer_name?: string;
}

const projectTypeLabels: Record<string, string> = {
  residential: 'سكني',
  commercial: 'تجاري',
  mixed: 'مختلط',
  industrial: 'صناعي',
};

const statusLabels: Record<string, string> = {
  planning: 'تخطيط',
  under_construction: 'قيد الإنشاء',
  completed: 'مكتمل',
  selling: 'للبيع',
};

const AdminDeveloperProjects = () => {
  const [projects, setProjects] = useState<DeveloperProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('developer_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch developer names
      const userIds = [...new Set((data || []).map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, company_name')
        .in('user_id', userIds);

      const profileMap = new Map(
        profiles?.map(p => [p.user_id, p.company_name || p.full_name || 'غير معروف']) || []
      );

      setProjects(
        (data || []).map(p => ({
          ...p,
          developer_name: profileMap.get(p.user_id) || 'غير معروف',
        }))
      );
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء جلب المشاريع', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;

    const { error } = await supabase.from('developer_projects').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحذف', variant: 'destructive' });
    } else {
      toast({ title: 'تم الحذف', description: 'تم حذف المشروع بنجاح' });
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredProjects = projects.filter(p => {
    if (searchQuery && !p.title.includes(searchQuery) && !p.developer_name?.includes(searchQuery) && !p.city?.includes(searchQuery)) {
      return false;
    }
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const totalProjects = projects.length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const underConstructionCount = projects.filter(p => p.status === 'under_construction').length;

  if (loading) {
    return <div className="flex justify-center py-12"><p>جاري التحميل...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HardHat className="h-6 w-6 text-primary" />
          إدارة مشاريع المطورين
        </h2>
        <p className="text-muted-foreground mt-1">عرض وإدارة جميع مشاريع المطورين العقاريين</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشاريع</p>
                <p className="text-3xl font-bold text-blue-600">{totalProjects}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد الإنشاء</p>
                <p className="text-3xl font-bold text-yellow-600">{underConstructionCount}</p>
              </div>
              <HardHat className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مكتملة</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن مشروع أو مطور..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="planning">تخطيط</SelectItem>
                <SelectItem value="under_construction">قيد الإنشاء</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="selling">للبيع</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardHat className="h-5 w-5" />
            قائمة المشاريع ({filteredProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الصورة</TableHead>
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">المطور</TableHead>
                  <TableHead className="text-right">المدينة</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإنجاز</TableHead>
                  <TableHead className="text-right">الوحدات</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {project.images && project.images[0] ? (
                          <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HardHat className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium truncate max-w-[200px]">{project.title}</p>
                      {project.price_from && (
                        <p className="text-xs text-muted-foreground">
                          من {project.price_from.toLocaleString()} ر.س
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{project.developer_name}</TableCell>
                    <TableCell>
                      {project.city ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {project.city}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{projectTypeLabels[project.project_type] || project.project_type}</TableCell>
                    <TableCell>
                      <Badge variant={project.status === 'completed' ? 'default' : project.status === 'under_construction' ? 'secondary' : 'outline'}>
                        {statusLabels[project.status] || project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{ width: `${project.completion_percentage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{project.completion_percentage || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.total_units ? (
                        <span className="text-sm">
                          {project.available_units || 0}/{project.total_units}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link to={`/developer/${project.user_id}`}>
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <HardHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد مشاريع</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDeveloperProjects;
