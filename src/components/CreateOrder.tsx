import React, { useEffect, useState } from 'react';
import {
  Form, Input, Button, Select, Card, Row, Col,
  InputNumber, Space, message, Image, Divider
} from 'antd';
import { 
  PlusOutlined, 
  MinusCircleOutlined, 
  ShoppingCartOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/CreateOrder.css';

const { Option } = Select;

type Product = {
  id: number;
  name: string;
  img: string;
  price: number;
  unit: string;
};

const CreateOrder: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API_URL ='http://localhost:8000/api';
  const DJOLI_API_URL ='https://api-preprod.djoli.africa/api/v1/rest/mobile/catalog/products-standards';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* Charger produits Djoli */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* Remplir automatiquement details produit */
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

  /* Soumission form */
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
      await axios.post(`${API_URL}/orders`, payload);
      message.success("Commande créée avec succès !");
      navigate('/');
    } catch (err: any) {
      console.error('Erreur complète:', err.response?.data);
      message.error(err?.response?.data?.message || err?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`create-order-container ${isMobile ? 'create-order-container-mobile' : ''}`}>
      <Card className="create-order-card">
        {/* Header */}
        <div className="create-order-header">
          <div className="create-order-header-icon">
            <ShoppingCartOutlined className="create-order-header-icon-svg" />
          </div>
          <div>
            <h1 className="create-order-header-title">
              {isMobile ? 'Nouvelle Commande' : 'Créer une Nouvelle Commande'}
            </h1>
            <p className="create-order-header-subtitle">
              Remplissez les informations
            </p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ items: [{ quantity: 1 }] }}
        >
          {/* Info client */}
          <div className="create-order-client-info">
            <h3 className="create-order-client-title">
              <UserOutlined className="create-order-client-title-icon" /> Informations Client
            </h3>
            <Row gutter={isMobile ? 12 : 16}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label={<span className="create-order-form-label">Nom du client</span>}
                  name="customer_name" 
                  rules={[{ required: true, message: 'Le nom est requis' }]}
                >
                  <Input 
                    size={isMobile ? 'middle' : 'large'}
                    prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="Ex: Jean Kouassi"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label={<span className="create-order-form-label">Téléphone</span>}
                  name="customer_phone"
                  rules={[
                    { required: true, message: 'Le téléphone est requis' },
                    { pattern: /^\d{10}$/, message: "10 chiffres requis" }
                  ]}
                >
                  <Input 
                    size={isMobile ? 'middle' : 'large'}
                    maxLength={10} 
                    prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="0123456789"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {!isMobile && <Divider style={{ margin: '24px 0' }} />}

          {/* Liste produits */}
          <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
            <h3 style={{ 
              fontSize: isMobile ? '14px' : '16px', 
              fontWeight: 600, 
              color: '#111827', 
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShoppingCartOutlined style={{ color: '#16a34a' }} /> Produits
            </h3>
            <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#6b7280', margin: 0 }}>
              Ajoutez les produits à commander
            </p>
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => {
                  const currentItem = form.getFieldValue(['items', field.name]);
                  const selectedProduct = products.find(p => p.id === currentItem?.product_id);

                  return (
                    <Card
                      key={field.key}
                      size="small"
                      className={`create-order-product-card ${isMobile ? 'create-order-product-card-mobile' : ''}`}
                      extra={fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                          size={isMobile ? 'small' : 'middle'}
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          {!isMobile && 'Retirer'}
                        </Button>
                      )}
                    >
                      {isMobile ? (
                        // Vue Mobile layout vertical
                        <div className="create-order-product-mobile-container">
                          {/* Image et Select produit */}
                          <Row gutter={12} align="middle" className="create-order-product-mobile-section">
                            {selectedProduct?.img && (
                              <Col span={6}>
                                <div className="create-order-product-image create-order-product-image-mobile">
                                  <Image
                                    src={selectedProduct.img}
                                    alt={selectedProduct.name}
                                    width={46}
                                    height={46}
                                    style={{ objectFit: 'cover' }}
                                    preview={false}
                                  />
                                </div>
                              </Col>
                            )}
                            <Col span={selectedProduct?.img ? 18 : 24}>
                              <Form.Item
                                label={<span className="create-order-form-label">Produit</span>}
                                name={[field.name, "product_id"]}
                                rules={[{ required: true, message: 'Requis' }]}
                                className="create-order-product-field"
                              >
                                <Select
                                  size="middle"
                                  loading={loading}
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
                                      {p.name}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Quantité et Prix */}
                          <Row gutter={12} className="create-order-product-mobile-section">
                            <Col span={12}>
                              <Form.Item
                                label={<span className="create-order-form-label">Quantité</span>}
                                name={[field.name, "quantity"]}
                                rules={[{ required: true, message: 'Requis' }]}
                                className="create-order-product-field"
                              >
                                <InputNumber
                                  size="middle"
                                  min={1}
                                  style={{ width: "100%", borderRadius: '8px' }}
                                  onChange={() => recalcItem(field.name)}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                label={<span className="create-order-form-label">Prix unitaire</span>}
                                name={[field.name, "unit_price"]}
                                rules={[{ required: true, message: 'Requis' }]}
                                className="create-order-product-field"
                              >
                                <InputNumber
                                  size="middle"
                                  min={0}
                                  style={{ width: "100%", borderRadius: '8px' }}
                                  onChange={() => recalcItem(field.name)}
                                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          {/* Unité et Sous-total */}
                          <Row gutter={12}>
                            <Col span={10}>
                              <Form.Item
                                label={<span className="create-order-form-label">Unité</span>}
                                name={[field.name, "unit"]}
                                className="create-order-product-field"
                              >
                                <Input 
                                  size="middle"
                                  disabled 
                                  style={{ borderRadius: '8px' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={14}>
                              <Form.Item
                                label={<span className="create-order-subtotal-label">Sous-total</span>}
                                name={[field.name, "subtotal"]}
                                className="create-order-product-field"
                              >
                                <InputNumber
                                  size="middle"
                                  readOnly 
                                  className="create-order-subtotal-input"
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
                        </div>
                      ) : (
                        // Vue sur desktop layout horizontal
                        <Row gutter={12} align="middle" className="create-order-product-row-desktop">
                          {selectedProduct?.img && (
                            <Col span={2}>
                              <div className="create-order-product-image">
                                <Image
                                  src={selectedProduct.img}
                                  alt={selectedProduct.name}
                                  width={56}
                                  height={56}
                                  style={{ objectFit: 'cover' }}
                                  preview={false}
                                />
                              </div>
                            </Col>
                          )}

                          <Col span={selectedProduct?.img ? 8 : 10}>
                            <Form.Item
                              label={<span className="create-order-form-label">Produit</span>}
                              name={[field.name, "product_id"]}
                              rules={[{ required: true, message: 'Requis' }]}
                              className="create-order-product-field"
                            >
                              <Select
                                size="large"
                                loading={loading}
                                placeholder="Sélectionner un produit"
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

                          <Col span={3}>
                            <Form.Item
                              label={<span className="create-order-form-label">Quantité</span>}
                              name={[field.name, "quantity"]}
                              rules={[{ required: true, message: 'Requis' }]}
                              className="create-order-product-field"
                            >
                              <InputNumber
                                size="large"
                                min={1}
                                style={{ width: "100%", borderRadius: '8px' }}
                                onChange={() => recalcItem(field.name)}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={4}>
                            <Form.Item
                              label={<span className="create-order-form-label">Prix unitaire</span>}
                              name={[field.name, "unit_price"]}
                              rules={[{ required: true, message: 'Requis' }]}
                              className="create-order-product-field"
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

                          <Col span={3}>
                            <Form.Item
                              label={<span className="create-order-form-label">Unité</span>}
                              name={[field.name, "unit"]}
                              className="create-order-product-field"
                            >
                              <Input 
                                size="large"
                                disabled 
                                style={{ borderRadius: '8px' }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={4}>
                            <Form.Item
                              label={<span className="create-order-subtotal-label">Sous-total</span>}
                              name={[field.name, "subtotal"]}
                              className="create-order-product-field"
                            >
                              <InputNumber
                                size="large"
                                readOnly 
                                className="create-order-subtotal-input"
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
                      )}
                    </Card>
                  );
                })}

                <Button 
                  type="dashed" 
                  block 
                  size={isMobile ? 'middle' : 'large'}
                  onClick={() => add({ quantity: 1 })} 
                  icon={<PlusOutlined />}
                  className={`create-order-add-button ${isMobile ? 'create-order-add-button-mobile' : ''}`}
                >
                  Ajouter un produit
                </Button>
              </>
            )}
          </Form.List>

          {/* Total */}
          <Form.Item shouldUpdate style={{ marginTop: isMobile ? '16px' : '24px' }}>
            {() => {
              const items = form.getFieldValue("items") || [];
              const total = items.reduce((s: number, it: any) => s + (it?.subtotal || 0), 0);

              return (
                <div className={`create-order-total-box ${isMobile ? 'create-order-total-box-mobile' : ''}`}>
                  <span className={`create-order-total-label ${isMobile ? 'create-order-total-label-mobile' : ''}`}>
                    TOTAL
                  </span>
                  <span className={`create-order-total-amount ${isMobile ? 'create-order-total-amount-mobile' : ''}`}>
                    {total.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              );
            }}
          </Form.Item>

          {/* Boutons d'action */}
          <Space 
            size="middle" 
            className={`create-order-action-buttons ${isMobile ? 'create-order-action-buttons-mobile' : ''}`}
          >
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              size={isMobile ? 'middle' : 'large'}
              className={`create-order-submit-button ${isMobile ? 'create-order-submit-button-mobile' : ''}`}
            >
              Créer la commande
            </Button>
            <Button 
              onClick={() => navigate(-1)}
              size={isMobile ? 'middle' : 'large'}
              className={`create-order-cancel-button ${isMobile ? 'create-order-cancel-button-mobile' : ''}`}
            >
              Annuler
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default CreateOrder;