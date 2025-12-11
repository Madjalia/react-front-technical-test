import React, { useEffect, useState } from 'react';
import {
  Form, Input, Button, Select, Card, Row, Col,
  InputNumber, Space, message, Image, Divider, Spin
} from 'antd';
import { 
  PlusOutlined, 
  MinusCircleOutlined, 
  EditOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../assets/styles/EditOrder.css';

const { Option } = Select;

type Product = {
  id: number;
  name: string;
  img: string;
  price: number;
  unit: string;
};

interface OrderItem {
  id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_img: string;
  unit: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  total: number;
  items: OrderItem[];
}

const EditOrder: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  
  const API_URL ='http://localhost:8000/api';
  const DJOLI_API_URL ='https://api-preprod.djoli.africa/api/v1/rest/mobile/catalog/products-standards';

  // Verifie taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* Charger produits Djoli */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await axios.get(DJOLI_API_URL);
        const items = res.data?.data?.data ?? [];
        setProducts(
          items.map((p: any) => ({
            id: p.id,
            name: p.name,
            img: p.img,
            price: p.price,
            unit: p.unit?.translation?.title ?? '',
          }))
        );
      } catch {
        message.error("Impossible de charger les produits.");
      }
    };

    loadProducts();
  }, []);

  /* Charger commande existante */
  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/orders/${id}`);
        const orderData = res.data;
        setOrder(orderData);

        // Pré remplir formulaire
        form.setFieldsValue({
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          items: orderData.items.map((item: OrderItem) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            product_img: item.product_img || item.img,
            unit: item.unit,
            unit_price: item.unit_price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        });
      } catch (error) {
        console.error('Erreur de chargement:', error);
        message.error('Erreur lors du chargement de la commande');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id, form, navigate, API_URL]);

  /* Remplir automatiquement details  produit */
  const setProductDetails = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const items = form.getFieldValue("items") || [];
    const qty = Number(items[index]?.quantity || 1);

    items[index] = {
      ...items[index],
      product_id: product.id,
      product_name: product.name,
      product_img: product.img,
      unit: product.unit,
      unit_price: product.price,
      quantity: qty,
      subtotal: qty * product.price,
    };

    form.setFieldsValue({ items });
  };

  /* Recalcul item */
  const recalcItem = (index: number) => {
    const items = form.getFieldValue("items") || [];
    const it = items[index];
    if (!it) return;

    const subtotal = Number(it.quantity || 1) * Number(it.unit_price || 0);
    items[index].subtotal = subtotal;

    form.setFieldsValue({ items });
  };

  /* Soumission du form */
  const onFinish = async (values: any) => {
    if (!values.items || values.items.length === 0) {
      message.error("Ajoutez au moins un produit.");
      return;
    }

    const items = values.items.map((it: any) => ({
      product_id: it.product_id,
      product_name: it.product_name,
      unit: it.unit,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
      subtotal: Number(it.quantity) * Number(it.unit_price),
      product_img: it.product_img,
    }));

    const total = items.reduce((s: number, it: any) => s + it.subtotal, 0);

    const payload = {
      customer_name: values.customer_name,
      customer_phone: values.customer_phone,
      total: total,
      items: items,
    };

    try {
      setSubmitting(true);
      await axios.put(`${API_URL}/orders/${id}`, payload);
      message.success("Commande modifiée avec succès !");
      navigate(`/order/${id}`);
    } catch (err: any) {
      console.error('Erreur complète:', err.response?.data);
      message.error(err?.response?.data?.message || err?.message || "Erreur lors de la modification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-order-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="edit-order-container">
      <Card className="edit-order-card">
        {/* Header */}
        <div className="edit-order-header">
          <div className="edit-order-header-icon">
            <EditOutlined className="edit-order-icon" />
          </div>
          <div>
            <h1 className="edit-order-header-title">
              Modifier la Commande #{order?.id.toString().padStart(5, '0')}
            </h1>
            <p className="edit-order-header-subtitle">
              Modifiez les informations de la commande
            </p>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Info client */}
          <div className="edit-order-client-info">
            <h3 className="edit-order-client-title">
              <UserOutlined /> Informations Client
            </h3>
            <Row gutter={16} className="edit-order-client-info-row">
              <Col xs={24} sm={24} md={12} className="edit-order-client-info-col">
                <Form.Item 
                  label={<span className="edit-order-form-item-label">Nom du client</span>}
                  name="customer_name" 
                  rules={[{ required: true, message: 'Le nom est requis' }]}
                >
                  <Input 
                    size="large"
                    prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="Ex: Jean Kouassi"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={12} className="edit-order-client-info-col">
                <Form.Item
                  label={<span className="edit-order-form-item-label">Téléphone</span>}
                  name="customer_phone"
                  rules={[
                    { required: true, message: 'Le téléphone est requis' },
                    { pattern: /^\d{10}$/, message: "10 chiffres requis" }
                  ]}
                >
                  <Input 
                    size="large"
                    maxLength={10} 
                    prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="0123456789"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '24px 0' }} />

          {/* Liste produits */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: '#111827', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <EditOutlined style={{ color: '#d97706' }} /> Produits
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Modifiez les produits de la commande
            </p>
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => {
                  const currentItem = form.getFieldValue(['items', field.name]);
                  const selectedProduct = products.find(p => p.id === currentItem?.product_id);
                  const itemImg = currentItem?.product_img || selectedProduct?.img;

                  return (
                    <Card
                      key={field.key}
                      size="small"
                      className="edit-order-product-card"
                      extra={fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                          style={{ display: 'flex', alignItems: 'center' }}
                          size={isMobile ? 'small' : 'middle'}
                        >
                          {!isMobile && 'Retirer'}
                        </Button>
                      )}
                    >
                      <Row gutter={12} align="top" className="edit-order-product-card-row">
                        {/* Image produit */}
                        {itemImg && (
                          <Col xs={24} sm={24} md={3} className="edit-order-product-image-col">
                            <div className="edit-order-product-image">
                              <Image
                                src={itemImg}
                                alt={currentItem?.product_name}
                                width="100%"
                                height={80}
                                style={{ objectFit: 'cover' }}
                                preview={false}
                              />
                            </div>
                          </Col>
                        )}

                        {/* Select produit */}
                        <Col xs={24} sm={24} md={itemImg ? 9 : 12} className="edit-order-product-field-col">
                          <Form.Item
                            label={<span className="edit-order-form-item-label">Produit</span>}
                            name={[field.name, "product_id"]}
                            rules={[{ required: true, message: 'Requis' }]}
                            className="edit-order-product-field"
                          >
                            <Select
                              size="large"
                              loading={products.length === 0}
                              placeholder="Sélectionner"
                              onChange={(v) => setProductDetails(field.name, v)}
                              style={{ borderRadius: '8px' }}
                              showSearch
                              filterOption={(input, option) =>
                                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {products.map(p => (
                                <Option key={p.id} value={p.id}>
                                  {p.name} — {p.price.toLocaleString('fr-FR')} FCFA
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        {/* Quantité */}
                        <Col xs={12} sm={8} md={3} className="edit-order-product-field-col">
                          <Form.Item
                            label={<span className="edit-order-form-item-label">Qté</span>}
                            name={[field.name, "quantity"]}
                            rules={[{ required: true, message: 'Requis' }]}
                            className="edit-order-product-field"
                          >
                            <InputNumber
                              size="large"
                              min={1}
                              style={{ width: "100%", borderRadius: '8px' }}
                              onChange={() => recalcItem(field.name)}
                            />
                          </Form.Item>
                        </Col>

                        {/* Prix unitaire */}
                        <Col xs={12} sm={8} md={4} className="edit-order-product-field-col">
                          <Form.Item
                            label={<span className="edit-order-form-item-label">Prix unit.</span>}
                            name={[field.name, "unit_price"]}
                            rules={[{ required: true, message: 'Requis' }]}
                            className="edit-order-product-field"
                          >
                            <InputNumber
                              size="large"
                              min={0}
                              style={{ width: "100%", borderRadius: '8px' }}
                              onChange={() => recalcItem(field.name)}
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                            />
                          </Form.Item>
                        </Col>

                        {/* Unité */}
                        <Col xs={12} sm={8} md={2} className="edit-order-product-field-col">
                          <Form.Item
                            label={<span className="edit-order-form-item-label">Unité</span>}
                            name={[field.name, "unit"]}
                            className="edit-order-product-field"
                          >
                            <Input 
                              size="large"
                              disabled 
                              style={{ borderRadius: '8px' }}
                            />
                          </Form.Item>
                        </Col>

                        {/* Sous total */}
                        <Col xs={12} sm={24} md={3} className="edit-order-product-field-col">
                          <Form.Item
                            label={<span className="edit-order-form-item-label edit-order-subtotal">Total</span>}
                            name={[field.name, "subtotal"]}
                            className="edit-order-product-field"
                          >
                            <InputNumber
                              size="large"
                              readOnly 
                              style={{ 
                                width: "100%", 
                                borderRadius: '8px',
                                fontWeight: 600,
                                color: '#16a34a'
                              }}
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}

                <Button 
                  type="dashed" 
                  block 
                  size="large"
                  onClick={() => add({ quantity: 1 })} 
                  icon={<PlusOutlined />}
                  className="edit-order-add-button"
                >
                  Ajouter un produit
                </Button>
              </>
            )}
          </Form.List>

          {/* Total */}
          <Form.Item shouldUpdate style={{ marginTop: '24px' }}>
            {() => {
              const items = form.getFieldValue("items") || [];
              const total = items.reduce((s: number, it: any) => s + (it?.subtotal || 0), 0);

              return (
                <div className="edit-order-total-box">
                  <div className="edit-order-total-label">
                    <span>TOTAL</span>
                  </div>
                  <span className="edit-order-total-amount">
                    {total.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              );
            }}
          </Form.Item>

          {/* Boutons action */}
          <Space size="middle" className="edit-order-action-buttons">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              size="large"
              className="edit-order-save-button"
            >
              Enregistrer
            </Button>
            <Button 
              onClick={() => navigate(-1)}
              size="large"
              className="edit-order-cancel-button"
            >
              Annuler
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default EditOrder;