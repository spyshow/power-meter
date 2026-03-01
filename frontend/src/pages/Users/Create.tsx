import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const UserCreate: React.FC = () => {
    const { formProps, saveButtonProps } = useForm({
        resource: "users",
        action: "create",
        redirect: "list",
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: "Please input the username!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please input the password!" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="Role"
                    name="role"
                    initialValue="viewer"
                    rules={[{ required: true, message: "Please select a role!" }]}
                >
                    <Select>
                        <Select.Option value="admin">Admin</Select.Option>
                        <Select.Option value="operator">Operator</Select.Option>
                        <Select.Option value="viewer">Viewer</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Create>
    );
};
