import React from "react";
import { Layout, Card, Form, Input, Button, Typography, message } from "antd";
import { useLogin } from "@refinedev/core";
import { LockOutlined, UserOutlined, GlobalOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
    const { mutate: login, isLoading } = useLogin();

    const onFinish = (values: any) => {
        login(values);
    };

    return (
        <Layout style={{ height: "100vh", justifyContent: "center", alignItems: "center", background: "#f0f2f5" }}>
            <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "8px" }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <GlobalOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                    <Title level={3} style={{ margin: 0 }}>MCGI Power Logger</Title>
                    <Text type="secondary">Sign in to access the dashboard</Text>
                </div>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: "Please input your username!" }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={isLoading}>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{ textAlign: "center" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        Contact administrator if you don't have an account
                    </Text>
                </div>
            </Card>
        </Layout>
    );
};
