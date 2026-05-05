export default function DashboardLoading() {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '60vh', width: '100%',
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid rgba(139,92,246,0.15)',
                borderTopColor: '#8b5cf6',
                animation: 'spin 0.7s linear infinite',
            }} />
        </div>
    );
}
