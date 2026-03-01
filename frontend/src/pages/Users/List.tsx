import React from "react";
import {
    List,
    TagField,
    DateField,
    EditButton,
    DeleteButton,
    useTable,
} from "@refinedev/antd";
import { Table, Space } from "antd";

export const UserList: React.FC = () => {
    const { tableProps } = useTable({
        resource: "users",
        syncWithLocation: true,
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="ID" />
                <Table.Column dataIndex="username" title="Username" />
                <Table.Column 
                    dataIndex="role" 
                    title="Role" 
                    render={(value: string) => <TagField value={value} color={value === 'admin' ? 'red' : 'blue'} />}
                />
                <Table.Column 
                    dataIndex="createdAt" 
                    title="Created At" 
                    render={(value: string) => <DateField value={value} format="LLL" />}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_: any, record: any) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
