import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface SendMessageDialogProps {
  receiverId: string;
  propertyId?: string;
  propertyTitle?: string;
  trigger?: React.ReactNode;
}

const SendMessageDialog = ({
  receiverId,
  propertyId,
  propertyTitle,
  trigger,
}: SendMessageDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(
    propertyTitle ? `استفسار عن: ${propertyTitle}` : ""
  );
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    if (!subject.trim() || !content.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        property_id: propertyId || null,
        subject: subject.trim(),
        content: content.trim(),
      });

      if (error) throw error;

      // Get sender profile for notification
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      // Send email notification to receiver
      try {
        await supabase.functions.invoke("send-message-notification", {
          body: {
            receiverId,
            senderName: senderProfile?.full_name || user.email || "مستخدم",
            subject: subject.trim(),
            propertyTitle,
          },
        });
      } catch (emailError) {
        console.log("Email notification failed (non-critical):", emailError);
      }

      toast.success("تم إرسال الرسالة بنجاح");
      setSubject(propertyTitle ? `استفسار عن: ${propertyTitle}` : "");
      setContent("");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إرسال الرسالة");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return null;
  }

  if (user.id === receiverId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            راسل المالك
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إرسال رسالة</DialogTitle>
          <DialogDescription>
            تواصل مباشرة مع صاحب العقار
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">الموضوع</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="موضوع الرسالة"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">الرسالة</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              rows={5}
              className="resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? "جاري الإرسال..." : "إرسال"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageDialog;
