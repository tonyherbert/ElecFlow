import { Document, Page, Text, View } from "@react-pdf/renderer";
import dayjs from "dayjs";

import type { PDFReportData } from "./types";
import { styles } from "./report-styles";

type CircuitReportProps = {
  data: PDFReportData;
};

export function CircuitReport({ data }: CircuitReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{data.circuitName}</Text>
            <Text style={styles.subtitle}>Rapport de simulation</Text>
          </View>
          <View>
            <Text style={styles.timestamp}>
              {dayjs(data.timestamp).format("DD/MM/YYYY HH:mm")}
            </Text>
            <Text style={styles.timestamp}>{data.organizationName}</Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, styles.statBoxPowered]}>
              <Text style={[styles.statValue, styles.statValuePowered]}>
                {data.stats.powered}
              </Text>
              <Text style={styles.statLabel}>Recepteurs alimentes</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxNotPowered]}>
              <Text style={[styles.statValue, styles.statValueNotPowered]}>
                {data.stats.notPowered}
              </Text>
              <Text style={styles.statLabel}>Non alimentes</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxNeutral]}>
              <Text style={[styles.statValue, styles.statValueNeutral]}>
                {data.stats.percentage}%
              </Text>
              <Text style={styles.statLabel}>Taux d'alimentation</Text>
            </View>
          </View>
        </View>

        {/* Control States Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Etats des commandes ({data.states.length})
          </Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>
                Commande
              </Text>
              <Text style={[styles.tableCellSmall, styles.tableCellBold]}>
                Etat
              </Text>
            </View>
            {data.states.map((state) => (
              <View key={state.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{state.name}</Text>
                <View style={styles.tableCellSmall}>
                  <Text
                    style={[
                      styles.badge,
                      state.isActive ? styles.badgeActive : styles.badgeInactive,
                    ]}
                  >
                    {state.isActive ? "Actif" : "Inactif"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Receptor Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Details des recepteurs ({data.results.length})
          </Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>
                Recepteur
              </Text>
              <Text style={[styles.tableCellSmall, styles.tableCellBold]}>
                Statut
              </Text>
              <Text style={[styles.tableCellWide, styles.tableCellBold]}>
                Details
              </Text>
            </View>
            {data.results.map((result) => (
              <View key={result.receptorId} style={styles.tableRow}>
                <Text style={styles.tableCell}>{result.receptorName}</Text>
                <View style={styles.tableCellSmall}>
                  <Text
                    style={[
                      styles.badge,
                      result.isPowered
                        ? styles.badgePowered
                        : styles.badgeNotPowered,
                    ]}
                  >
                    {result.isPowered ? "Alimente" : "Non alimente"}
                  </Text>
                </View>
                <View style={styles.tableCellWide}>
                  {result.isPowered &&
                    result.activePath &&
                    result.activePath.length > 0 && (
                      <View style={styles.pathContainer}>
                        {result.activePath.map((segment, index) => (
                          <View
                            key={`${segment.linkId}-${index}`}
                            style={{ flexDirection: "row", alignItems: "center" }}
                          >
                            {index > 0 && <Text style={styles.arrow}>→</Text>}
                            <Text style={styles.pathSegment}>
                              {segment.linkName}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  {!result.isPowered && result.cutoffPoint && (
                    <View style={styles.cutoffContainer}>
                      <Text style={styles.cutoffText}>
                        Coupure: {result.cutoffPoint.linkName}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Genere par ElecFlow</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
