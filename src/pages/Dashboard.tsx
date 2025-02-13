import React, { useEffect, useState } from "react";
import {
  Card,
  Spin,
  Row,
  Col,
  Table,
  Input,
  DatePicker,
  Button,
  Select,
} from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { TablePaginationConfig } from "antd/es/table/interface";
import "../index.css";
import moment, { Moment } from "moment";
import dayjs from "dayjs";

const { Meta } = Card;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface VehicleHighlight {
  data: {
    total_draft: number;
    total_pending: number;
    total_rejected: number;
  };
}

interface Vehicle {
  id: string;
  approval_status: string;
  contact_number: string;
  country_code: string;
  ctime: number;
  driver: string;
  license_plate: string;
  mtime: number;
  passenger_capacity: number;
  trips: { from: string; to: string }[];
  vehicle_owner: string;
  vehicle_status: string;
  vehicle_type: string;
}

const Dashboard: React.FC = () => {
  const [licensePlateSearch, setlicensePlateSearch] = useState<string>("");
  const [highlights, setHighlights] = useState<VehicleHighlight | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });
  const [filter, setFilter] = useState<string>("");
  const [selectedHighlightFilter, setselectedHighlightFilter] =
    useState<string>("");

  const [appliedSearchTerm, setappliedSearchTerm] = useState<string>("");
  const [selectedDateRange, setselectedDateRange] = useState<
    [Moment | null, Moment | null] | null
  >(null);
  const [vehicleType, setVehicleType] = useState<string | undefined>(undefined);
  const [minPassengerCapacity, setMinPassengerCapacity] = useState<
    number | undefined
  >(undefined);
  const [maxPassengerCapacity, setMaxPassengerCapacity] = useState<
    number | undefined
  >(undefined);
  const [approvalStatus, setApprovalStatus] = useState<number | undefined>(
    undefined
  );
  const [vehicleStatus, setVehicleStatus] = useState<number | undefined>(
    undefined
  );

  const fetchVehicleData = async (
    pagination: TablePaginationConfig,
    sorter: any,
    filter: string,
    appliedSearchTerm: string
  ) => {
    try {
      setLoading(true);
      const filters: any = {};

      if (filter === "Draft") {
        filters.approval_status = 0;
      } else if (filter === "Rejected") {
        filters.approval_status = 3;
        filters.vehicle_status = 0;
      } else if (filter === "Pending Information") {
        filters.approval_status = 2;
        filters.vehicle_status = 0;
      }

      if (appliedSearchTerm) {
        filters.license_plate = appliedSearchTerm;
      }

      if (selectedDateRange) {
        filters.mtime_from = selectedDateRange[0]?.valueOf();
        filters.mtime_to = selectedDateRange[1]?.valueOf();
      }

      if (vehicleType) {
        filters.vehicle_type = vehicleType;
      }

      if (minPassengerCapacity !== undefined) {
        filters.passenger_capacity_min = minPassengerCapacity;
      }

      if (maxPassengerCapacity !== undefined) {
        filters.passenger_capacity_max = maxPassengerCapacity;
      }

      if (approvalStatus !== undefined) {
        filters.approval_status = approvalStatus;
      }

      if (vehicleStatus !== undefined) {
        filters.vehicle_status = vehicleStatus;
      }

      const requestBody = {
        page: pagination.current,
        size: pagination.pageSize,
        sortBy: sorter.field,
        sortOrder: sorter.order,
        ...filters,
      };

      const response = await fetch("/api/v1/ia/vehicle/get_all_vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vehicle data: ${response.status}`);
      }

      const data = await response.json();
      setVehicles(data?.data?.result || []);
      setPagination((prev) => ({ ...prev, total: data?.data?.total || 0 }));
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchVehicleHighlights = async () => {
      try {
        const response = await fetch("/api/v1/ia/vehicle/get_highlights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();
        setHighlights(data);
      } catch (error) {
        console.error("Error fetching vehicle highlights:", error);
      }
    };

    fetchVehicleHighlights();
    fetchVehicleData(pagination, {}, filter, licensePlateSearch);
  }, [
    selectedDateRange,
    filter,
    pagination.current,
    vehicleType,
    minPassengerCapacity,
    maxPassengerCapacity,
    approvalStatus,
    vehicleStatus,
  ]);

  const onTableChange = (
    pagination: TablePaginationConfig,
    filters: any,
    sorter: any
  ) => {
    setLoading(true);
    fetchVehicleData(pagination, sorter, filter, licensePlateSearch);
  };

  const onHighlightCardClick = (description: string) => {
    setselectedDateRange(null);
    setlicensePlateSearch("");
    if (selectedHighlightFilter === description) {
      setselectedHighlightFilter("");
      setFilter("");
    } else {
      setselectedHighlightFilter(description);
      setFilter(description);
    }
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!highlights || !vehicles) {
    return (
      <div className="p-6 text-center text-gray-600">No data available.</div>
    );
  }

  const clearFilters = () => {
    setlicensePlateSearch("");
    setappliedSearchTerm("");
    setselectedDateRange(null);
    setVehicleType(undefined);
    setMinPassengerCapacity(undefined);
    setMaxPassengerCapacity(undefined);
    setApprovalStatus(undefined);
    setVehicleStatus(undefined);
    setFilter("");
    setselectedHighlightFilter("");
    setLoading(true);
    fetchVehicleData(pagination, {}, "", "");
  };

  const cardsData = [
    {
      title: (highlights?.data?.total_draft ?? 0).toString(),
      description: "Draft",
    },
    {
      title: (highlights?.data?.total_pending ?? 0).toString(),
      description: "Pending Information",
    },
    {
      title: (highlights?.data?.total_rejected ?? 0).toString(),
      description: "Rejected",
    },
  ];

  const columns: ColumnsType<Vehicle> = [
    {
      title: "License Plate",
      dataIndex: "license_plate",
      key: "license_plate",
      fixed: "left",
      width: 150,
      sorter: true,
    },
    {
      title: "Driver",
      dataIndex: "driver",
      key: "driver",
      width: 150,
      sorter: true,
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicle_type",
      key: "vehicle_type",
      width: 150,
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "vehicle_status",
      key: "vehicle_status",
      width: 150,
      sorter: true,
    },
    {
      title: "Owner",
      dataIndex: "vehicle_owner",
      key: "vehicle_owner",
      width: 150,
      sorter: true,
    },
    {
      title: "Approval Status",
      dataIndex: "approval_status",
      key: "approval_status",
      width: 150,
      sorter: true,
    },
    {
      title: "Trips",
      dataIndex: "trips",
      key: "trips",
      render: (trips: { from: string; to: string }[]) =>
        trips.map((trip, index) => `${trip.from} to ${trip.to}`).join(", "),
      width: 150,
    },
  ];

  const onSearchEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      fetchVehicleData(pagination, {}, filter, licensePlateSearch);
      setappliedSearchTerm(licensePlateSearch);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Vehicle Dashboard</h1>

      <Row gutter={16} justify="center">
        {cardsData.map((card, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              className={`shadow-lg rounded-lg ${
                selectedHighlightFilter === card.description
                  ? "bg-gray-300"
                  : "bg-white"
              }`}
              actions={[
                <span
                  key="view"
                  onClick={() => onHighlightCardClick(card.description)}
                >
                  View <ArrowRightOutlined />
                </span>,
              ]}
            >
              <Meta
                title={<div className="text-xl font-bold">{card.title}</div>}
                description={card.description}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <div className="my-4 flex flex-col md:flex-row md:items-center gap-4">
        <Input
          placeholder="Search by License Plate"
          value={licensePlateSearch}
          onChange={(e) => setlicensePlateSearch(e.target.value)}
          onKeyDown={onSearchEnter}
        />

        <RangePicker
          allowClear
          value={
            selectedDateRange
              ? [
                  selectedDateRange[0]
                    ? dayjs(selectedDateRange[0].toISOString())
                    : null,
                  selectedDateRange[1]
                    ? dayjs(selectedDateRange[1].toISOString())
                    : null,
                ]
              : null
          }
          onChange={(dates) =>
            setselectedDateRange(
              dates
                ? [
                    dates[0] ? moment(dates[0].toISOString()) : null,
                    dates[1] ? moment(dates[1].toISOString()) : null,
                  ]
                : null
            )
          }
          className="w-full md:max-w-[15rem]"
        />
        <Select
          allowClear
          placeholder="Select Vehicle Type"
          value={vehicleType}
          onChange={(value) => setVehicleType(value)}
          className="w-full md:max-w-[15rem]"
        >
          <Option value="Truck">Truck</Option>
          <Option value="Bus">Bus</Option>
          <Option value="Van">Van</Option>
          <Option value="Taxi">Taxi</Option>
        </Select>
        <Input
          allowClear
          placeholder="Min Passenger Capacity"
          type="number"
          value={minPassengerCapacity ?? ""}
          onChange={(e) =>
            setMinPassengerCapacity(
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="w-full md:max-w-[15rem]"
        />
        <Input
          allowClear
          placeholder="Max Passenger Capacity"
          type="number"
          value={maxPassengerCapacity ?? ""}
          onChange={(e) =>
            setMaxPassengerCapacity(
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="w-full md:max-w-[15rem]"
        />
        <Select
          allowClear
          placeholder="Select Approval Status"
          value={approvalStatus}
          onChange={(value) =>
            setApprovalStatus(value !== undefined ? Number(value) : undefined)
          }
          className="w-full md:max-w-[15rem]"
        >
          <Option value={0}>Draft</Option>
          <Option value={1}>Approved</Option>
          <Option value={2}>Pending</Option>
          <Option value={3}>Rejected</Option>
        </Select>

        <Select
          allowClear
          placeholder="Select Vehicle Status"
          value={vehicleStatus}
          onChange={(value) =>
            setVehicleStatus(value !== undefined ? Number(value) : undefined)
          }
          className="w-full md:max-w-[15rem]"
        >
          <Option value={0}>Active</Option>
          <Option value={1}>Inactive</Option>
          <Option value={2}>Decommissioned</Option>
        </Select>

        <Button onClick={clearFilters} className="w-full md:max-w-[10rem]">
          Clear Filters
        </Button>
      </div>

      <Table<Vehicle>
        columns={columns}
        dataSource={vehicles}
        rowKey="id"
        scroll={{ x: "max-content", y: "490px" }}
        pagination={pagination}
        loading={loading}
        onChange={onTableChange}
      />
    </div>
  );
};

export default Dashboard;
