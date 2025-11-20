import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Calendar, 
  X, 
  RefreshCw, 
  Clock, 
  FileCheck, 
  ArrowLeft,
  Trash2,
  Filter,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNotificationsPaginated } from "@/hooks/useNotificationsPaginated";
import { useMarkNotificationAsRead } from "@/hooks/useMarkNotificationAsRead";
import { useMarkAllNotificationsAsRead } from "@/hooks/useMarkAllNotificationsAsRead";
import { useDeleteNotifications } from "@/hooks/useDeleteNotifications";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const ITEMS_PER_PAGE = 20;

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'visit_created':
      return <Calendar className="h-5 w-5 text-primary" />;
    case 'visit_cancelled':
      return <X className="h-5 w-5 text-destructive" />;
    case 'visit_rescheduled':
      return <RefreshCw className="h-5 w-5 text-orange-500" />;
    case 'visit_reminder':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'anamnesis_filled':
      return <FileCheck className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading, error } = useNotificationsPaginated({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    filter: filterStatus,
    type: filterType,
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotifications = useDeleteNotifications();

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    if (notification.client_id) {
      navigate(`/clientes/${notification.client_id}`);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDeleteAll = () => {
    deleteNotifications.mutate(undefined);
    setShowDeleteDialog(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner message="Carregando notificações..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <ErrorMessage message={error.message} />
      </div>
    );
  }

  const { notifications = [], totalCount = 0, totalPages = 0 } = data || {};
  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bell className="h-6 w-6" />
                  Notificações
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalCount} {totalCount === 1 ? 'notificação' : 'notificações'} no total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasUnread && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={totalCount === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar tudo
              </Button>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Select value={filterStatus} onValueChange={(v: any) => {
              setFilterStatus(v);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(v) => {
              setFilterType(v);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="visit_created">Agendamentos</SelectItem>
                <SelectItem value="visit_cancelled">Cancelamentos</SelectItem>
                <SelectItem value="visit_rescheduled">Reagendamentos</SelectItem>
                <SelectItem value="visit_reminder">Lembretes</SelectItem>
                <SelectItem value="anamnesis_filled">Fichas preenchidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
                <p className="text-sm text-muted-foreground">
                  {filterStatus !== 'all' || filterType !== 'all'
                    ? 'Nenhuma notificação encontrada com os filtros aplicados'
                    : 'Você não tem notificações no momento'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  !notification.read ? "border-l-4 border-l-primary bg-primary/5" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge variant="default" className="h-5 text-xs">
                            Nova
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 2
                    );
                  })
                  .map((page, index, array) => {
                    const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                    
                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsisBefore && (
                          <PaginationItem>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </div>
                    );
                  })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Página {currentPage} de {totalPages}
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todas as notificações?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as suas notificações serão
              permanentemente deletadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Limpar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notifications;
