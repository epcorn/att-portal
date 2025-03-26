/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInitials } from "../redux/user/userSlice";
import { getQuotes } from "../redux/quote/quoteSlice";
import {
  getContracts,
  getDashboardData,
} from "../redux/contract/contractSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MdDescription,
  MdAssignment,
  MdToday,
  MdCheckCircle,
  MdHourglassEmpty,
} from "react-icons/md";
import { unwrapResult } from "@reduxjs/toolkit";
import { StatCard } from "../components";

export default function Dashboard() {
  const dispatch = useDispatch();
  const [barChartData, setBarChartData] = useState();

  useEffect(() => {
    async function fn() {
      const result = await dispatch(getDashboardData());
      const data = await unwrapResult(result);
      setBarChartData(data);
    }
    fn();
    dispatch(getInitials());
    dispatch(getQuotes());
    dispatch(getContracts());
  }, [dispatch]);

  const quoteData = useSelector((state) => state.quote) || {};
  const contractData = useSelector((state) => state.contract) || {};

  const {
    totalQuotations = 0,
    todayQuotations = 0,
    approvePending = 0,
    approvedCount = 0,
    contractified = 0,
  } = quoteData;

  const {
    totalContracts = 0,
    todayContracts = 0,
    approvedCount: approvedContracts = 0,
    approvePending: pendingContracts = 0,
    contractWithoutQuote = 0,
    withoutNumberContract = 0,
  } = contractData;

  const quoteContractConversionRatio = Number(
    (contractified / totalQuotations) * 100
  ).toFixed(2);
  const stats = [
    {
      title: "Total Quotations",
      value: totalQuotations,
      icon: <MdDescription />,
      color: "border-blue-500",
      icons: [],
    },
    {
      title: "Total Contractified",
      value: contractified,
      icon: <MdAssignment />,
      color: "border-green-500",
      icons: [],
    },
    {
      title: "Today's Quotations",
      value: todayQuotations,
      icon: <MdToday />,
      color: "border-purple-500",
      icons: [],
    },
    {
      title: "Approved Quotes",
      value: approvedCount,
      icon: <MdCheckCircle />,
      color: "border-indigo-500",
      icons: [],
    },
    {
      title: "Pending Approval",
      value: approvePending,
      icon: <MdHourglassEmpty />,
      color: "border-yellow-500",
      icons: [],
    },
  ];

  const contractStats = [
    {
      title: "Total Contracts",
      value: totalContracts,
      icon: "😃", // Feeling positive about the overall performance
      color: "border-blue-500",
      icons: [],
    },
    {
      title: "Today's Contracts",
      value: todayContracts,
      icon: "😎", // Confident and in control on a busy day
      color: "border-green-500",
      icons: [],
    },
    {
      title: "Approved Contracts",
      value: approvedContracts,
      icon: "😁", // Satisfaction from seeing approvals
      color: "border-indigo-500",
      icons: [],
    },
    {
      title: "Pending Approval by Admin",
      value: pendingContracts,
      icon: "😕", // Concerned or cautious about what's still pending
      color: "border-yellow-500",
      icons: [],
    },
    {
      title: "Direct Contracts",
      value: contractWithoutQuote,
      icon: "🤔", // Puzzled by contracts coming directly without a quotation
      color: "border-purple-500",
      icons: [],
    },
    {
      title: "Without Number Contracts",
      value: withoutNumberContract,
      icon: "😰", // Worry about missing contract numbers—needs attention!
      color: "border-rose-500",
      icons: [],
    },
    {
      title: "Quote to Contract conversion ratio",
      value: quoteContractConversionRatio,
      icon: (() => {
        if (quoteContractConversionRatio > 80) return "🏆"; // Excellent conversion rate
        if (quoteContractConversionRatio > 50) return "📈"; // Good, but room for improvement
        if (quoteContractConversionRatio > 30) return "🤔"; // Needs attention
        return "😟"; // Low conversion, concerning
      })(),
      color: (() => {
        if (quoteContractConversionRatio > 70) return "border-green-500"; // Excellent conversion rate
        if (
          quoteContractConversionRatio < 70 &&
          quoteContractConversionRatio > 50
        )
          return "border-orange-500"; // Good, but room for improvement
        if (quoteContractConversionRatio > 30) return "border-red-500"; // Needs attention
        return "border-red-500"; // Low conversion, concerning
      })(),
      icons: [
        { id: "A", icon: "😟", text: "Low conversion, concerning" },
        { id: "B", icon: "🤔", text: "Needs attention" },
        { id: "C", icon: "📈", text: "Good, but room for improvement" },
        { id: "D", icon: "🏆", text: "Excellent conversion rate" },
      ],
    },
  ];

  return (
    <div className="mx-3 min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
      {/* Quotations Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      {/* Contracts Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {contractStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Contracts By Months</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barChartData?.contractData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "#666" }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                payload={[
                  { value: "This Year", type: "rect", color: "#8884d8" },
                  { value: "Last Year", type: "rect", color: "#82ca9d" },
                ]}
              />
              <Bar
                dataKey="thisYear"
                fill="#8884d8"
                name="This Year"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="lastYear"
                fill="#82ca9d"
                name="Last Year"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Quotations By Months</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barChartData?.quotationData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "#666" }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                payload={[
                  { value: "This Year", type: "rect", color: "#8884d8" },
                  { value: "Last Year", type: "rect", color: "#82ca9d" },
                ]}
              />
              <Bar
                dataKey="thisYear"
                fill="#8884d8"
                name="This Year"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="lastYear"
                fill="#82ca9d"
                name="Last Year"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
