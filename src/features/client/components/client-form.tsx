"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, useForm } from "@/features/form/tanstack-form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClientAction, updateClientAction } from "../actions/client.action";
import {
  createClientSchema,
  type CreateClientInput,
} from "../schemas/client.schema";

type ClientFormProps = {
  orgSlug: string;
  defaultValues?: CreateClientInput & { id?: string };
  mode?: "create" | "edit";
};

export function ClientForm({
  orgSlug,
  defaultValues,
  mode = "create",
}: ClientFormProps) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: CreateClientInput & { id?: string }) => {
      if (mode === "edit" && values.id) {
        return resolveActionResult(
          updateClientAction({
            id: values.id,
            ...values,
          })
        );
      }
      return resolveActionResult(createClientAction(values));
    },
    onSuccess: (result) => {
      if (mode === "create" && "clientId" in result) {
        toast.success("Client créé");
        router.push(`/orgs/${orgSlug}/clients/${result.clientId}`);
      } else {
        toast.success("Client mis à jour");
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm({
    schema: createClientSchema,
    defaultValues: defaultValues ?? {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
    onSubmit: async (values) => {
      await mutation.mutateAsync({
        ...values,
        id: defaultValues?.id,
      });
    },
  });

  const backUrl = mode === "edit" && defaultValues?.id
    ? `/orgs/${orgSlug}/clients/${defaultValues.id}`
    : `/orgs/${orgSlug}/clients`;

  return (
    <Form form={form}>
      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button variant="ghost" size="sm" asChild>
          <Link href={backUrl}>
            <ArrowLeft className="mr-2 size-4" />
            Retour
          </Link>
        </Button>
        <form.SubmitButton size="sm">
          {mode === "create" ? "Créer le client" : "Enregistrer"}
        </form.SubmitButton>
      </div>

      <div className="flex w-full flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Nom et coordonnées du client
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form.AppField name="name">
              {(field) => (
                <field.Field>
                  <field.Label>Nom *</field.Label>
                  <field.Content>
                    <field.Input placeholder="Nom du client" />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.Field>
                  <field.Label>Email</field.Label>
                  <field.Content>
                    <field.Input placeholder="email@example.com" type="email" />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>

            <form.AppField name="phone">
              {(field) => (
                <field.Field>
                  <field.Label>Téléphone</field.Label>
                  <field.Content>
                    <field.Input placeholder="06 12 34 56 78" />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>

            <form.AppField name="address">
              {(field) => (
                <field.Field>
                  <field.Label>Adresse</field.Label>
                  <field.Content>
                    <field.Input placeholder="Adresse complète" />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Informations complémentaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form.AppField name="notes">
              {(field) => (
                <field.Field>
                  <field.Content>
                    <field.Textarea
                      placeholder="Notes sur le client..."
                      rows={4}
                    />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}
