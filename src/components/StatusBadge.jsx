const statusStyles = {
  Draft: 'bg-gray-100 text-gray-700 border-gray-300',
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Approved: 'bg-green-100 text-green-700 border-green-300',
  Rejected: 'bg-red-100 text-red-700 border-red-300',
  Expired: 'bg-red-50 text-red-600 border-red-200'
};

export default function StatusBadge({ status, expired = false }) {
  const displayStatus = expired ? 'Expired' : status;
  const style = statusStyles[displayStatus] || statusStyles.Draft;

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
      {displayStatus}
    </span>
  );
}
