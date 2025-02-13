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
  const [inputValue, setInputValue] = useState<string>("");
  const [highlights, setHighlights] = useState<VehicleHighlight | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });
  const [filter, setFilter] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<
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

  const fetchVehicles = async (
    pagination: TablePaginationConfig,
    sorter: any,
    filter: string,
    searchTerm: string
  ) => {
    try {
      setLoading(true);

      // Construct filters directly
      const filters: any = {};

      // Apply filtering based on selected card
      if (filter === "Draft") {
        filters.approval_status = 0; // Draft
      } else if (filter === "Rejected") {
        filters.approval_status = 3; // Rejected
        filters.vehicle_status = 0; // Active
      } else if (filter === "Pending Information") {
        filters.approval_status = 2; // Pending
        filters.vehicle_status = 0; // Active
      }

      if (searchTerm) {
        filters.license_plate = searchTerm;
      }

      if (dateRange) {
        filters.mtime_from = dateRange[0]?.valueOf();
        filters.mtime_to = dateRange[1]?.valueOf();
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

      // Construct request body without filterCriteria wrapper
      const requestBody = {
        page: pagination.current,
        size: pagination.pageSize,
        sortBy: sorter.field,
        sortOrder: sorter.order,
        ...filters, // Spread filters directly
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
    const fetchHighlights = async () => {
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

    fetchHighlights();
    fetchVehicles(pagination, {}, filter, inputValue); // Initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateRange,
    filter,
    pagination.current,
    vehicleType,
    minPassengerCapacity,
    maxPassengerCapacity,
    approvalStatus,
    vehicleStatus,
  ]);

  // useEffect(() => {
  //   fetchVehicles(pagination, {}, filter, searchTerm);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchTerm]); // Triggers API call when searchTerm updates

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: any,
    sorter: any
  ) => {
    setLoading(true);
    fetchVehicles(pagination, sorter, filter, inputValue); // Call the fetchVehicles function here
  };

  const handleCardClick = (description: string) => {
    setDateRange(null);
    setInputValue("");
    if (selectedCard === description) {
      // If the card is already selected, deselect it
      setSelectedCard(""); // Reset the selected card
      setFilter(""); // Reset the filter
    } else {
      // Select the card and apply filter
      setSelectedCard(description);
      setFilter(description); // Set filter based on selected card
    }
    setLoading(true); // Trigger loading state when a new filter is applied
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

  const handleClearFilters = () => {
    setInputValue("");
    setSearchTerm("");
    setDateRange(null);
    setVehicleType(undefined);
    setMinPassengerCapacity(undefined);
    setMaxPassengerCapacity(undefined);
    setApprovalStatus(undefined);
    setVehicleStatus(undefined);
    setFilter("");
    setSelectedCard("");
    setLoading(true);
    fetchVehicles(pagination, {}, "", "");
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
      sorter: true, // Enable sorting
    },
    {
      title: "Driver",
      dataIndex: "driver",
      key: "driver",
      width: 150,
      sorter: true, // Enable sorting
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicle_type",
      key: "vehicle_type",
      width: 150,
      sorter: true, // Enable sorting
    },
    {
      title: "Status",
      dataIndex: "vehicle_status",
      key: "vehicle_status",
      width: 150,
      sorter: true, // Enable sorting
    },
    {
      title: "Owner",
      dataIndex: "vehicle_owner",
      key: "vehicle_owner",
      width: 150,
      sorter: true, // Enable sorting
    },
    {
      title: "Approval Status",
      dataIndex: "approval_status",
      key: "approval_status",
      width: 150,
      sorter: true, // Enable sorting
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

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      fetchVehicles(pagination, {}, filter, inputValue); // Use inputValue directly
      setSearchTerm(inputValue); // Update state after triggering search
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* <h1 className="text-3xl font-bold mb-6">Vehicle Dashboard</h1> */}

      <Row gutter={16} justify="center">
        {cardsData.map((card, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              className={`shadow-lg rounded-lg ${
                selectedCard === card.description ? "bg-gray-300" : "bg-white"
              }`}
              actions={[
                <span
                  key="view"
                  onClick={() => handleCardClick(card.description)}
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
        {/* <Input
          allowClear
          placeholder="Search by License Plate"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              setSearchTerm(inputValue); // Set the search term
              setLoading(true); // Trigger loading state
              fetchVehicles(pagination, {}, filter); // Fetch filtered data
            }
          }}
          className="w-full md:max-w-[15rem]"
        /> */}

        <Input
          placeholder="Search by License Plate"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleSearch} // Use onKeyDown instead of onKeyPress
        />

        <RangePicker
          allowClear
          value={
            dateRange
              ? [
                  dateRange[0] ? dayjs(dateRange[0].toISOString()) : null,
                  dateRange[1] ? dayjs(dateRange[1].toISOString()) : null,
                ]
              : null
          }
          onChange={(dates) =>
            setDateRange(
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
          onChange={(value) => setApprovalStatus(Number(value))}
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
          onChange={(value) => setVehicleStatus(Number(value))}
          className="w-full md:max-w-[15rem]"
        >
          <Option value={0}>Active</Option>
          <Option value={1}>Inactive</Option>
          <Option value={2}>Decommissioned</Option>
        </Select>

        <Button
          onClick={handleClearFilters}
          className="w-full md:max-w-[10rem]"
        >
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
        onChange={handleTableChange}
      />
    </div>
  );
};

export default Dashboard;
