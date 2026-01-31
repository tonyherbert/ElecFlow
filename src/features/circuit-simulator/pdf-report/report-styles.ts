import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#1f2937",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
  },
  statBoxPowered: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  statBoxNotPowered: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
  },
  statBoxNeutral: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statValuePowered: {
    color: "#16a34a",
  },
  statValueNotPowered: {
    color: "#dc2626",
  },
  statValueNeutral: {
    color: "#374151",
  },
  statLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    padding: 8,
    flex: 1,
  },
  tableCellSmall: {
    padding: 8,
    width: 90,
  },
  tableCellWide: {
    padding: 8,
    flex: 2,
  },
  tableCellBold: {
    fontWeight: "bold",
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 9,
  },
  badgePowered: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },
  badgeNotPowered: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  badgeActive: {
    backgroundColor: "#dbeafe",
    color: "#2563eb",
  },
  badgeInactive: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  pathContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 2,
  },
  pathSegment: {
    fontSize: 8,
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  arrow: {
    fontSize: 8,
    color: "#9ca3af",
    marginHorizontal: 2,
  },
  cutoffContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 6,
    borderRadius: 3,
  },
  cutoffText: {
    fontSize: 9,
    color: "#92400e",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
});
