import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const UserEdit: React.FC = () => {
    const { formProps, saveButtonProps } = useForm({
        resource: "users",
        action: "edit",
        redirect: "list",
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
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
                    help="Leave blank to keep current password"
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="Role"
                    name="role"
                    rules={[{ required: true, message: "Please select a role!" }]}
                >
                    <Select>
                        <Select.Option value="admin">Admin</Select.Option>
                        <Select.Option value="operator">Operator</Select.Option>
                        <Select.Option value="viewer">Viewer</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Edit>
    );
};
