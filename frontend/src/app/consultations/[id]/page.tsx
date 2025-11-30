"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useSubscription, gql } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const GET_CONSULTATION = gql`
  query GetConsultation($id: UUID!) {
    consultation(id: $id) {
      id
      patient {
        id
        name
        phone
        age
        pathologies
      }
      status
      messages {
        id
        senderId
        senderType
        content
        photoUrl
        audioUrl
        createdAt
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($consultationId: UUID!, $content: String!) {
    sendMessage(consultationId: $consultationId, content: $content) {
      id
      content
      createdAt
    }
  }
`;

const MESSAGES_SUBSCRIPTION = gql`
  subscription OnMessageAdded($consultationId: UUID!) {
    messageAdded(consultationId: $consultationId) {
      id
      senderId
      senderType
      content
      photoUrl
      audioUrl
      createdAt
    }
  }
`;

const UPDATE_CONSULTATION_STATUS = gql`
  mutation UpdateConsultationStatus($id: UUID!, $status: String!) {
    updateConsultation(id: $id, status: $status) {
      id
      status
    }
  }
`;

export default function ConsultationChatPage() {
  const params = useParams();
  const consultationId = params.id as string;
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, loading } = useQuery(GET_CONSULTATION, {
    variables: { id: consultationId },
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [updateStatus] = useMutation(UPDATE_CONSULTATION_STATUS);

  // Subscription pour les nouveaux messages
  const { data: subscriptionData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { consultationId },
    skip: !consultationId,
  });

  const consultation = data?.consultation;
  const messages = consultation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, subscriptionData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        variables: {
          consultationId,
          content: message.trim(),
        },
      });
      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    }
  };

  const handleCompleteConsultation = async () => {
    try {
      await updateStatus({
        variables: {
          id: consultationId,
          status: "completed",
        },
      });
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  if (loading) return <div className="text-center">Chargement...</div>;
  if (!consultation) return <div className="text-center">Consultation non trouvée</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      {/* En-tête avec infos patient */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {consultation.patient.name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{consultation.patient.name || "Patient"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {consultation.patient.phone} {consultation.patient.age && `• ${consultation.patient.age} ans`}
                </p>
                {consultation.patient.pathologies && consultation.patient.pathologies.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {consultation.patient.pathologies.map((pathology: string, idx: number) => (
                      <Badge key={idx} variant="outline">{pathology}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Voir PDF
              </Button>
              {consultation.status === "active" && (
                <Button variant="default" size="sm" onClick={handleCompleteConsultation}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Terminer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Zone de messages */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="flex h-full flex-col p-4">
          <div className="flex-1 space-y-4 overflow-y-auto">
            {messages.map((msg: any) => {
              const isDoctor = msg.senderType === "doctor";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isDoctor
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {format(new Date(msg.createdAt), "HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

