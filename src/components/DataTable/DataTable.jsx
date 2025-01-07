import { useState, useEffect } from "react";

const DataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [currentPage, search, perPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL("https://api.razzakfashion.com/");
      url.searchParams.append("paginate", perPage);
      url.searchParams.append("page", currentPage);
      if (search) url.searchParams.append("search", search);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setData(result.data);
      setPagination({
        currentPage: result.current_page,
        perPage: result.per_page,
        total: result.total,
        lastPage: result.last_page,
        hasNext: !!result.next_page_url,
        hasPrev: !!result.prev_page_url,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const splitName = (fullName) => {
    const names = fullName.split(" ");
    return {
      firstName: names[0],
      lastName: names.slice(1).join(" "),
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="container mx-auto px-4 py-8">
        {/* Search and Per Page Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search here"
            className="w-full md:w-96 p-2 rounded bg-gray-800/50 border border-gray-700 
                     text-gray-300 placeholder-gray-500 focus:outline-none focus:border-red-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-lg border border-gray-700 bg-gray-800/30 backdrop-blur-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4 text-left text-gray-400 font-medium">
                  First Name
                </th>
                <th className="p-4 text-left text-gray-400 font-medium">
                  Last Name
                </th>
                <th className="p-4 text-left text-gray-400 font-medium">
                  Email
                </th>
                <th className="p-4 text-left text-gray-400 font-medium">
                  Created At
                </th>
                <th className="p-4 text-left text-gray-400 font-medium">
                  Updated At
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-8">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce" />
                      <div
                        className="w-4 h-4 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-4 h-4 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-500">
                    No results found
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const { firstName, lastName } = splitName(item.name);
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="p-4 text-gray-300">{firstName}</td>
                      <td className="p-4 text-gray-300">{lastName}</td>
                      <td className="p-4 text-gray-300">{item.email}</td>
                      <td className="p-4 text-gray-300">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-300">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination Controls */}
        <div className="mt-4 flex items-center justify-end gap-4 px-4 py-2 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Rows per page</span>
            <select
              value={perPage}
              onChange={handlePerPageChange}
              className="bg-transparent text-gray-300 border-none focus:outline-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="text-sm text-gray-400">
            {(pagination.currentPage - 1) * pagination.perPage + 1}-
            {Math.min(
              pagination.currentPage * pagination.perPage,
              pagination.total
            )}{" "}
            of {pagination.total}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-50 
                       disabled:hover:text-gray-400"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!pagination.hasNext}
              className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-50 
                       disabled:hover:text-gray-400"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
