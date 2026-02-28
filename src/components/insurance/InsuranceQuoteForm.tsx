import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, message } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import insuranceService from '../../services/insuranceService';
import type { InsuranceQuoteRequest } from '../../services/insuranceService';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface InsuranceQuoteFormProps {
  rentalId?: string;
  initialData?: Partial<InsuranceQuoteRequest>;
  onQuoteCreated?: (quote: any) => void;
}

const InsuranceQuoteForm: React.FC<InsuranceQuoteFormProps> = ({
  rentalId,
  initialData,
  onQuoteCreated,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const quoteData: InsuranceQuoteRequest = {
        provider: values.provider,
        propertyAddress: values.propertyAddress,
        propertyValue: values.propertyValue,
        monthlyRent: values.monthlyRent,
        tenantName: values.tenantName,
        tenantDocument: values.tenantDocument,
        tenantEmail: values.tenantEmail,
        tenantPhone: values.tenantPhone,
        rentalStartDate: values.rentalDates[0].format('YYYY-MM-DD'),
        rentalEndDate: values.rentalDates[1].format('YYYY-MM-DD'),
        coverageType: values.coverageType,
        rentalId,
      };

      const quote = await insuranceService.createQuote(quoteData);
      
      if (quote.status === 'COMPLETED') {
        message.success('Cotação realizada com sucesso!');
        if (onQuoteCreated) {
          onQuoteCreated(quote);
        }
      } else if (quote.status === 'ERROR') {
        message.error('Erro ao obter cotação. Tente novamente.');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erro ao criar cotação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <span>
          <SafetyOutlined style={{ marginRight: 8 }} />
          Solicitar Cotação de Seguro Fiança
        </span>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          provider: 'POTTENCIAL',
          ...initialData,
        }}
      >
        <Form.Item
          label="Seguradora"
          name="provider"
          rules={[{ required: true, message: 'Selecione a seguradora' }]}
        >
          <Select placeholder="Selecione a seguradora">
            <Option value="POTTENCIAL">Pottencial Seguros</Option>
            <Option value="JUNTO_SEGUROS">Junto Seguros</Option>
            <Option value="TOKIO_MARINE">Tokio Marine</Option>
            <Option value="PORTO_SEGURO">Porto Seguro</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Endereço do Imóvel"
          name="propertyAddress"
          rules={[{ required: true, message: 'Informe o endereço do imóvel' }]}
        >
          <Input placeholder="Rua, número, bairro, cidade - UF" />
        </Form.Item>

        <Form.Item
          label="Valor do Imóvel"
          name="propertyValue"
          rules={[{ required: true, message: 'Informe o valor do imóvel' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="0,00"
            formatter={(value) =>
              `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
            }
            parser={(value) => value!.replace(/R\$\s?|(,*)/g, '')}
            min={0}
          />
        </Form.Item>

        <Form.Item
          label="Valor do Aluguel Mensal"
          name="monthlyRent"
          rules={[{ required: true, message: 'Informe o valor do aluguel' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="0,00"
            formatter={(value) =>
              `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
            }
            parser={(value) => value!.replace(/R\$\s?|(,*)/g, '')}
            min={0}
          />
        </Form.Item>

        <Form.Item
          label="Nome do Inquilino"
          name="tenantName"
          rules={[{ required: true, message: 'Informe o nome do inquilino' }]}
        >
          <Input placeholder="Nome completo" />
        </Form.Item>

        <Form.Item
          label="CPF/CNPJ do Inquilino"
          name="tenantDocument"
          rules={[{ required: true, message: 'Informe o CPF/CNPJ' }]}
        >
          <Input placeholder="000.000.000-00" />
        </Form.Item>

        <Form.Item label="E-mail do Inquilino" name="tenantEmail">
          <Input type="email" placeholder="email@exemplo.com" />
        </Form.Item>

        <Form.Item label="Telefone do Inquilino" name="tenantPhone">
          <Input placeholder="(00) 00000-0000" />
        </Form.Item>

        <Form.Item
          label="Período da Locação"
          name="rentalDates"
          rules={[{ required: true, message: 'Selecione o período' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={['Data de início', 'Data de término']}
          />
        </Form.Item>

        <Form.Item label="Tipo de Cobertura" name="coverageType">
          <Select placeholder="Selecione o tipo de cobertura">
            <Option value="BASICA">Básica</Option>
            <Option value="COMPLETA">Completa</Option>
            <Option value="PREMIUM">Premium</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Solicitar Cotação
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InsuranceQuoteForm;
