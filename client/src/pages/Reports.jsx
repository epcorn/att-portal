/* eslint-disable react/prop-types */
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MdDateRange,
  MdDescription,
  MdAttachMoney,
  MdPeople,
} from "react-icons/md";
import { useState } from "react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("sales");

  // Dummy data for charts
  const salesData = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 4500 },
    { name: "May", value: 6000 },
    { name: "Jun", value: 5500 },
  ];

  const productData = [
    { name: "Product A", value: 400 },
    { name: "Product B", value: 300 },
    { name: "Product C", value: 300 },
    { name: "Product D", value: 200 },
  ];

  const customerData = [
    { name: "New", value: 400 },
    { name: "Returning", value: 300 },
    { name: "Inactive", value: 300 },
  ];

  const ReportCard = ({ title, icon, isActive, onClick }) => (
    <div
      className={`p-4 rounded-lg shadow-md cursor-pointer transition-all ${
        isActive ? "bg-blue-500 text-white" : "bg-white hover:bg-blue-100"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div
          className={`text-2xl mr-3 ${
            isActive ? "text-white" : "text-blue-500"
          }`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    </div>
  );

  return (
    <div className="mx-3 p-6">
      <h1 className="text-3xl font-bold mb-6">Reports Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ReportCard
          title="Sales Report"
          icon={<MdAttachMoney />}
          isActive={selectedReport === "sales"}
          onClick={() => setSelectedReport("sales")}
        />
        <ReportCard
          title="Product Performance"
          icon={<MdDescription />}
          isActive={selectedReport === "product"}
          onClick={() => setSelectedReport("product")}
        />
        <ReportCard
          title="Customer Segmentation"
          icon={<MdPeople />}
          isActive={selectedReport === "customer"}
          onClick={() => setSelectedReport("customer")}
        />
        <ReportCard
          title="Time Period"
          icon={<MdDateRange />}
          isActive={selectedReport === "time"}
          onClick={() => setSelectedReport("time")}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {selectedReport === "sales" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Sales Report</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}

        {selectedReport === "product" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Product Performance</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {selectedReport === "customer" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              Customer Segmentation
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={customerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {customerData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}

        {selectedReport === "time" && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">
              Time Period Selector
            </h2>
            <p>
              Here you can add date pickers or time range selectors for
              customizing report periods.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
