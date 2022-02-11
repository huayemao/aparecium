const MappedTable = ({ data, propertyNames, customCell: Component }) => {
  let filteredData = data.map((v) =>
    Object.keys(v)
      .filter((k) => propertyNames.includes(k))
      .reduce((acc, key) => ((acc[key] = v[key]), acc), {})
  );
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden ">
            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  {propertyNames.map((val) => (
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                      key={`h_${val}`}
                    >
                      {val}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {data.map((val, i) => (
                  <tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    key={`i_${i}`}
                  >
                    {propertyNames.map((p, i, arr) => (
                      <td
                        width={Math.floor(100 / arr.length) + "%"}
                        className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        key={`i_${i}_${p}`}
                      >
                        {Component && (
                          <Component
                            value={val[p]}
                            propertyName={p}
                            item={val}
                          ></Component>
                        )}
                        {!Component && val[p]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappedTable;
