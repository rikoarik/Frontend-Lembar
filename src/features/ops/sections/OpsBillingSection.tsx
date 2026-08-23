import { Button } from '@/app/components/ui';
import {
  AdminPageHeader,
  AdminPill,
  AdminToolbar,
  AdminFilterChip,
  AdminDataTable,
  AdminContentLoading,
} from '@/src/features/admin/AdminChrome';
import { AdminPagination } from '../components/AdminPagination';
import { billingTone } from '../utils/opsToneUtils';
import {
  adminService,
  type AdminBillingRow,
  type PaymentOrder,
} from '@/src/services/admin/adminService';

export function OpsBillingSection({
  billingData,
  billingMeta,
  billingLoading,
  billingEditRow,
  setBillingEditRow,
  billingEditState,
  setBillingEditState,
  billingEditSeats,
  setBillingEditSeats,
  billingEditRenews,
  setBillingEditRenews,
  billingEditLoading,
  setBillingEditLoading,
  billingPage,
  setBillingPage,
  billingTab,
  setBillingTab,
  paymentOrdersData,
  paymentOrdersMeta,
  paymentOrdersLoading,
  paymentOrdersPage,
  setPaymentOrdersPage,
  filterOrderStatus,
  setFilterOrderStatus,
  search,
  setSearch,
  filterBilling,
  setFilterBilling,
  loadBilling,
  setToast,
}: {
  billingData: AdminBillingRow[];
  billingMeta: { total: number; pages: number };
  billingLoading: boolean;
  billingEditRow: AdminBillingRow | null;
  setBillingEditRow: (row: AdminBillingRow | null) => void;
  billingEditState: AdminBillingRow['state'];
  setBillingEditState: (st: AdminBillingRow['state']) => void;
  billingEditSeats: string;
  setBillingEditSeats: (v: string) => void;
  billingEditRenews: string;
  setBillingEditRenews: (v: string) => void;
  billingEditLoading: boolean;
  setBillingEditLoading: (v: boolean) => void;
  billingPage: number;
  setBillingPage: (p: number) => void;
  billingTab: 'langganan' | 'orders';
  setBillingTab: (tab: 'langganan' | 'orders') => void;
  paymentOrdersData: PaymentOrder[];
  paymentOrdersMeta: { total: number; pages: number };
  paymentOrdersLoading: boolean;
  paymentOrdersPage: number;
  setPaymentOrdersPage: (p: number) => void;
  filterOrderStatus: string;
  setFilterOrderStatus: (s: string) => void;
  search: string;
  setSearch: (v: string) => void;
  filterBilling: '' | AdminBillingRow['state'];
  setFilterBilling: (v: '' | AdminBillingRow['state']) => void;
  loadBilling: (stateVal?: AdminBillingRow['state'], searchVal?: string, pg?: number) => void;
  setToast: (msg: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Billing</h2>
      </div>
      {billingLoading ? <AdminContentLoading /> : null}

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 border-b border-[#ddd4c8]/60">
        {(['langganan', 'orders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setBillingTab(tab)}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              billingTab === tab
                ? 'border-[#171717] text-[#171717]'
                : 'border-transparent text-[#6d665d] hover:text-[#171717]'
            }`}
          >
            {tab === 'langganan' ? 'Langganan' : 'Payment Orders'}
          </button>
        ))}
      </div>

      {billingTab === 'langganan' ? (
        <>
          {/* Billing edit modal */}
          {billingEditRow ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={() => setBillingEditRow(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[16px] text-[#171717]">
                    Kelola Billing — {billingEditRow.school}
                  </h3>
                  <button
                    className="text-[#6d665d] hover:text-[#171717] text-xl leading-none"
                    onClick={() => setBillingEditRow(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="billing-edit-state"
                      className="block text-[12px] font-semibold text-[#6d665d] mb-1"
                    >
                      State
                    </label>
                    <select
                      id="billing-edit-state"
                      value={billingEditState}
                      onChange={(e) =>
                        setBillingEditState(e.target.value as AdminBillingRow['state'])
                      }
                      className="w-full h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                    >
                      <option value="active">active</option>
                      <option value="grace">grace</option>
                      <option value="blocked">blocked</option>
                      <option value="expired">expired</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="billing-edit-seats"
                      className="block text-[12px] font-semibold text-[#6d665d] mb-1"
                    >
                      Seats
                    </label>
                    <input
                      id="billing-edit-seats"
                      type="number"
                      min="0"
                      value={billingEditSeats}
                      onChange={(e) => setBillingEditSeats(e.target.value)}
                      className="w-full h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="billing-edit-renews"
                      className="block text-[12px] font-semibold text-[#6d665d] mb-1"
                    >
                      Tanggal Perpanjangan
                    </label>
                    <input
                      id="billing-edit-renews"
                      type="date"
                      value={billingEditRenews}
                      onChange={(e) => setBillingEditRenews(e.target.value)}
                      className="w-full h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    disabled={billingEditLoading}
                    onClick={() => {
                      setBillingEditLoading(true);
                      adminService
                        .updateBilling(billingEditRow.id, {
                          state: billingEditState,
                          seats: billingEditSeats ? Number(billingEditSeats) : undefined,
                          renewsAt: billingEditRenews || undefined,
                        })
                        .then((res) => {
                          if (res.ok) {
                            setToast(`Billing ${billingEditRow.school} berhasil diperbarui.`);
                            setBillingEditRow(null);
                            loadBilling();
                          } else {
                            setToast(`Gagal: ${res.error.safeMessage}`);
                          }
                          setBillingEditLoading(false);
                        });
                    }}
                  >
                    {billingEditLoading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setBillingEditRow(null)}>
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari sekolah / state"
            filters={
              <>
                {(['', 'active', 'grace', 'blocked', 'expired'] as const).map((state) => (
                  <AdminFilterChip
                    key={state || 'all'}
                    active={filterBilling === state}
                    onClick={() => setFilterBilling(state)}
                  >
                    {state || 'Semua state'}
                  </AdminFilterChip>
                ))}
              </>
            }
          />
          <AdminDataTable
            rows={billingData}
            emptyLabel="Tidak ada data billing yang cocok."
            columns={[
              {
                key: 'school',
                header: 'Sekolah',
                render: (row) => <span className="font-semibold">{row.school}</span>,
              },
              {
                key: 'state',
                header: 'State',
                render: (row) => <AdminPill tone={billingTone(row.state)}>{row.state}</AdminPill>,
              },
              {
                key: 'seats',
                header: 'Seats',
                render: (row) => <span className="tabular-nums">{row.seats}</span>,
              },
              {
                key: 'renew',
                header: 'Perpanjangan',
                render: (row) => (
                  <span className="text-[12px] text-[#6d665d]">{row.renewsAt ?? '—'}</span>
                ),
              },
            ]}
            rowActions={(row) => (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setBillingEditRow(row);
                  setBillingEditState(row.state);
                  setBillingEditSeats(String(row.seats ?? ''));
                  setBillingEditRenews(row.renewsAt ? row.renewsAt.split('T')[0] : '');
                }}
              >
                Kelola
              </Button>
            )}
          />
          <AdminPagination
            currentPage={billingPage}
            totalPages={billingMeta.pages}
            totalItems={billingMeta.total}
            pageSize={10}
            onPageChange={setBillingPage}
          />
        </>
      ) : null}

      {billingTab === 'orders' ? (
        <>
          {paymentOrdersLoading ? <AdminContentLoading /> : null}
          <AdminToolbar
            search={''}
            onSearchChange={() => {}}
            searchPlaceholder="Cari workspace ID"
            filters={
              <>
                {(['', 'pending', 'paid', 'failed', 'expired', 'cancelled'] as const).map((s) => (
                  <AdminFilterChip
                    key={s || 'all'}
                    active={filterOrderStatus === s}
                    onClick={() => setFilterOrderStatus(s)}
                  >
                    {s || 'Semua'}
                  </AdminFilterChip>
                ))}
              </>
            }
          />
          <AdminDataTable
            rows={paymentOrdersData}
            emptyLabel="Tidak ada payment orders."
            columns={[
              {
                key: 'school',
                header: 'Workspace',
                render: (row: any) => <span className="font-semibold">{row.workspaceId}</span>,
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (row: any) => (
                  <span className="tabular-nums">
                    {row.currency}{' '}
                    {(Number(row.amountCents) / 100).toLocaleString('id-ID', {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (row: any) => {
                  const tone =
                    row.status === 'paid'
                      ? 'ok'
                      : row.status === 'pending'
                        ? 'warn'
                        : row.status === 'failed'
                          ? 'bad'
                          : 'neutral';
                  return <AdminPill tone={tone}>{row.status}</AdminPill>;
                },
              },

              {
                key: 'createdAt',
                header: 'Tanggal',
                render: (row: any) => (
                  <span className="text-[11px] tabular-nums text-[#6d665d]">
                    {row.createdAt?.slice(0, 10) ?? '—'}
                  </span>
                ),
              },
            ]}
          />
          <AdminPagination
            currentPage={paymentOrdersPage}
            totalPages={paymentOrdersMeta.pages}
            totalItems={paymentOrdersMeta.total}
            pageSize={20}
            onPageChange={(p) => setPaymentOrdersPage(p)}
          />
        </>
      ) : null}
    </>
  );
}
