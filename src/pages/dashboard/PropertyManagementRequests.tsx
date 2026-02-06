import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  FileText, 
  MapPin, 
  Phone, 
  User, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;

// Yellow marker for property
const propertyIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #eab308;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface ManagementRequest {
  id: string;
  user_id: string;
  requester_name: string;
  requester_phone: string;
  property_type: string;
  property_address: string;
  property_latitude?: number;
  property_longitude?: number;
  notes?: string;
  status: string;
  created_at: string;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  land: 'أرض',
  building: 'عمارة',
  office: 'مكتب',
  shop: 'محل تجاري',
};

const PropertyManagementRequests = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [requests, setRequests] = useState<ManagementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ManagementRequest | null>(null);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchRequests();
      setupRealtime();
    }
  }, [user, authLoading]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('property_management_requests')
        .select('*')
        .eq('office_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data as ManagementRequest[]) || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    if (!user) return;

    const channel = supabase
      .channel('property_management_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_management_requests',
          filter: `office_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRequests(prev => [payload.new as ManagementRequest, ...prev]);
            toast({
              title: 'طلب جديد',
              description: `طلب جديد من ${(payload.new as ManagementRequest).requester_name}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => 
              prev.map(req => req.id === payload.new.id ? payload.new as ManagementRequest : req)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleStatusUpdate = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    setUpdating(requestId);

    try {
      const { error } = await supabase
        .from('property_management_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      const request = requests.find(r => r.id === requestId);
      if (request) {
        await supabase.from('notifications').insert({
          user_id: request.user_id,
          type: 'property_management_response',
          title: newStatus === 'accepted' ? 'تم قبول طلبك' : 'تم رفض طلبك',
          message: newStatus === 'accepted' 
            ? 'تم قبول طلب إدارة الأملاك الخاص بك وسيتم التواصل معك قريباً'
            : 'نعتذر، تم رفض طلب إدارة الأملاك الخاص بك',
        });
      }

      toast({
        title: newStatus === 'accepted' ? 'تم القبول' : 'تم الرفض',
        description: 'تم تحديث حالة الطلب وإشعار المستخدم',
      });

      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الحالة',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const openMapDialog = (request: ManagementRequest) => {
    setSelectedRequest(request);
    setShowMapDialog(true);
  };

  useEffect(() => {
    if (!showMapDialog || !mapContainerRef.current || !selectedRequest?.property_latitude) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    mapRef.current = L.map(mapContainerRef.current).setView(
      [selectedRequest.property_latitude!, selectedRequest.property_longitude!],
      15
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current);

    L.marker([selectedRequest.property_latitude!, selectedRequest.property_longitude!], { icon: propertyIcon })
      .addTo(mapRef.current)
      .bindPopup(`<div style="direction: rtl;">${selectedRequest.property_address}</div>`)
      .openPopup();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMapDialog, selectedRequest]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 ml-1" />مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 ml-1" />مرفوض</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 ml-1" />قيد الانتظار</Badge>;
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard/office')} className="mb-6">
          <ChevronLeft className="h-4 w-4 ml-1" />
          رجوع للوحة التحكم
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">طلبات إدارة الأملاك</h1>
            <p className="text-muted-foreground">إدارة طلبات إدارة الأملاك الواردة</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                  <p className="text-sm text-muted-foreground">مقبولة</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-sm text-muted-foreground">مرفوضة</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>الطلبات الواردة</CardTitle>
              <CardDescription>جميع طلبات إدارة الأملاك المرسلة إليك</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{request.requester_name}</span>
                              </div>
                              {getStatusBadge(request.status)}
                            </div>

                            <div className="grid gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span dir="ltr">{request.requester_phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{propertyTypeLabels[request.property_type] || request.property_type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{request.property_address}</span>
                              </div>
                            </div>

                            {request.notes && (
                              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {request.notes}
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2">
                            {request.property_latitude && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openMapDialog(request)}
                              >
                                <MapPin className="h-4 w-4 ml-1" />
                                عرض الموقع
                              </Button>
                            )}
                            
                            {request.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(request.id, 'accepted')}
                                  disabled={updating === request.id}
                                >
                                  {updating === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 ml-1" />
                                      قبول
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                  disabled={updating === request.id}
                                >
                                  <XCircle className="h-4 w-4 ml-1" />
                                  رفض
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Map Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              موقع العقار
            </DialogTitle>
          </DialogHeader>
          <div 
            ref={mapContainerRef} 
            className="h-[400px] rounded-lg overflow-hidden"
            style={{ zIndex: 0 }}
          />
          {/* Legend */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span>موقع العقار</span>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PropertyManagementRequests;