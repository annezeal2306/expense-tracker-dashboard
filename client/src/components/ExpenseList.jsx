const ExpenseList = ({ expenses, onDelete }) => {
  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    if (dateValue._seconds) {
      return new Date(dateValue._seconds * 1000).toLocaleDateString();
    }
    return new Date(dateValue).toLocaleDateString();
  };

  if (!expenses.length) {
    return <div className="table-empty">No expenses yet.</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Amount (₹)</th>
          <th>Note</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((e) => (
          <tr key={e.id}>
            <td>{formatDate(e.date)}</td>
            <td>{e.category}</td>
            <td>{e.amount}</td>
            <td>{e.note}</td>
            <td>
              <button
                className="btn-icon"
                type="button"
                onClick={() => onDelete(e.id)}
              >
                delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ExpenseList;
