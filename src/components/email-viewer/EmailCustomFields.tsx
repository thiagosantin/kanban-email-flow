
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "./emailUtils";

interface CustomFields {
  notes: string;
  monetaryValue: string;
}

export function EmailCustomFields() {
  const [customFields, setCustomFields] = useState<CustomFields>({
    notes: '',
    monetaryValue: ''
  });

  const form = useForm<CustomFields>({
    defaultValues: {
      notes: '',
      monetaryValue: ''
    }
  });

  const handleFieldChange = (field: keyof CustomFields, value: string) => {
    setCustomFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMonetaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove currency formatting for storage
    const numericValue = value.replace(/\D/g, '');
    handleFieldChange('monetaryValue', numericValue);
  };

  // Display formatted value
  const displayMonetaryValue = customFields.monetaryValue 
    ? formatCurrency(customFields.monetaryValue) 
    : 'R$ 0,00';

  return (
    <div className="rounded-md border p-4 bg-background/50">
      <h3 className="font-medium mb-3">Campos Personalizados</h3>
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anotações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Adicione anotações sobre este email..." 
                    value={customFields.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    className="resize-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="monetaryValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor em R$</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="R$ 0,00" 
                    value={displayMonetaryValue}
                    onChange={handleMonetaryInputChange}
                    className="font-medium"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}
