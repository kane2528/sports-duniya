
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';
import { articlesState, payoutRateState } from '@/recoil/atoms';
import Filters from '@/components/Filters';
import Navbar from '@/components/Navbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import Charts from '@/components/Charts';

export default function Dashboard() {
    const router = useRouter();
    const [articles, setArticles] = useRecoilState(articlesState);
    const [payoutRates, setPayoutRates] = useRecoilState(payoutRateState);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('user');

    useEffect(() => {
        const auth = JSON.parse(Cookies.get('auth') || '{}');
        if (!auth.role) return router.push('/');
        setRole(auth.role);
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { data } = await axios.get(
                    `https://newsapi.org/v2/everything?q=technology&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`
                );
                if (data?.articles) setArticles(data.articles);
            } catch (err) {
                console.error('Failed to fetch news:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('payoutRates') || '{}');
        setPayoutRates(stored);
    }, []);

    const uniqueAuthors = [...new Set(articles.map((a) => a.author).filter(Boolean))];

    const calculatePayout = (author) => {
        const count = articles.filter((a) => a.author === author).length;
        const rate = payoutRates[author] || 0;
        return count * rate;
    };

    const exportCSVData = uniqueAuthors.map((author) => {
        const count = articles.filter((a) => a.author === author).length;
        const rate = payoutRates[author] || 0;
        const total = count * rate;
        return {
            Author: author,
            Articles: count,
            'Rate (₹)': rate,
            'Total (₹)': total,
        };
    });

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const tableData = uniqueAuthors.map((author) => {
            const count = articles.filter((a) => a.author === author).length;
            const rate = payoutRates[author] || 0;
            const total = count * rate;
            return [author, count, `₹${rate}`, `₹${total}`];
        });

        autoTable(doc, {
            head: [['Author', 'Articles', 'Rate (₹)', 'Total (₹)']],
            body: tableData,
        });

        doc.save('payouts.pdf');
    };

    const totalPayout = uniqueAuthors.reduce((acc, author) => acc + calculatePayout(author), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar role={role} />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar role={role} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        📊 Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Monitor your content performance and manage payouts
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8">
                    <Filters />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 m-8 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Authors</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueAuthors.length}</p>
                            </div>
                        </div>
                    </div>

                    {role === 'admin' && (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payout</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalPayout.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Rate</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ₹{uniqueAuthors.length > 0 ? Math.round(totalPayout / articles.length) : 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Charts Section */}
                <div className="mb-8">
                    <Charts />
                </div>

                {/* Payout Calculator - Admin Only */}
                {role === 'admin' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">💰 Payout Calculator</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Manage author rates and calculate payouts
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleExportPDF}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export PDF
                                    </button>
                                    <CSVLink
                                        data={exportCSVData}
                                        filename="payouts.csv"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export CSV
                                    </CSVLink>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Articles</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate (₹)</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {uniqueAuthors.map((author, index) => (
                                        <tr
                                            key={author}
                                            className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-white">
                                                                {author.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {author}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {articles.filter((a) => a.author === author).length}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={payoutRates[author] || ''}
                                                    placeholder="0.00"
                                                    onChange={(e) => {
                                                        const updated = {
                                                            ...payoutRates,
                                                            [author]: parseFloat(e.target.value) || 0,
                                                        };
                                                        setPayoutRates(updated);
                                                        localStorage.setItem('payoutRates', JSON.stringify(updated));
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                    ₹{calculatePayout(author).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Articles Grid */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">📰 Latest Articles</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Browse through the latest technology articles
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article, index) => (
                                <div
                                    key={index}
                                    className="group bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-600">
                                        {article.urlToImage ? (
                                            <img
                                                src={article.urlToImage}
                                                alt={article.title}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500" style={{ display: article.urlToImage ? 'none' : 'flex' }}>
                                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {article.title}
                                        </h3>

                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                            {article.description}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                {article.author || 'Unknown'}
                                            </span>
                                            <span>
                                                {new Date(article.publishedAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                                                {article.source?.name || 'N/A'}
                                            </span>

                                            <a
                                                href={article.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                            >
                                                Read more
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
