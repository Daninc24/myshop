import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
Chart.register(...registerables);

const AdminPerformanceDashboard = () => {
  const [data, setData] = useState({ salesByStaff: [], topProducts: [], paymentBreakdown: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/pos/performance-dashboard', {
        params: { startDate, endDate }
      });
      setData(res.data);
    } catch (err) {
      setError('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  const staffLabels = data.salesByStaff.map(s => s.name);
  const staffSales = data.salesByStaff.map(s => s.totalSales);
  const productLabels = data.topProducts.map(p => p.name);
  const productSales = data.topProducts.map(p => p.totalSold);
  const paymentLabels = Object.keys(data.paymentBreakdown);
  const paymentTotals = Object.values(data.paymentBreakdown);

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <div className="card">
        <h1 className="text-3xl font-heading font-bold text-secondary mb-6">Performance Dashboard</h1>
        <div className="mb-6 flex gap-4 items-center">
          <label className="font-medium">Start Date:</label>
          <input type="date" className="input-field max-w-xs" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label className="font-medium">End Date:</label>
          <input type="date" className="input-field max-w-xs" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-primary" onClick={fetchData}>Filter</button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Sales by Staff */}
            <div className="card mb-8">
              <h2 className="text-lg font-heading font-semibold mb-2 text-secondary">Sales by Staff</h2>
              <Bar
                data={{
                  labels: staffLabels,
                  datasets: [
                    {
                      label: 'Total Sales',
                      data: staffSales,
                      backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
            </div>
            {/* Top Products */}
            <div className="card mb-8">
              <h2 className="text-lg font-heading font-semibold mb-2 text-secondary">Top Products</h2>
              <Bar
                data={{
                  labels: productLabels,
                  datasets: [
                    {
                      label: 'Total Sold',
                      data: productSales,
                      backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
            </div>
            {/* Payment Breakdown */}
            <div className="card mb-8">
              <h2 className="text-lg font-heading font-semibold mb-2 text-secondary">Payment Breakdown</h2>
              <Pie
                data={{
                  labels: paymentLabels,
                  datasets: [
                    {
                      label: 'Total Sales',
                      data: paymentTotals,
                      backgroundColor: [
                        'rgba(37, 99, 235, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(251, 191, 36, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                      ],
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPerformanceDashboard; 