import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#ffffff",
    border: "1 solid #e5e7eb",
    borderRadius: 4,
  },
  sectionAnalysis: {
    marginTop: 60,
    padding: 10,
    backgroundColor: "#ffffff",
    border: "1 solid #e5e7eb",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  text: {
    fontSize: 11,
    marginBottom: 5,
    color: "#374151",
  },
  label: {
    fontSize: 11,
    color: "#6b7280",
    width: 120,
  },
  value: {
    fontSize: 11,
    color: "#111827",
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  scoreBox: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    width: "48%",
    borderRadius: 4,
  },
  scoreTitle: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 5,
    textAlign: "center",
  },
  scoreValue: {
    fontSize: 18,
    color: "#1e3a8a",
    textAlign: "center",
    fontWeight: "bold",
  },
  insightBox: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  insightTitle: {
    fontSize: 12,
    color: "#111827",
    marginBottom: 5,
    fontWeight: "bold",
  },
  questionTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
  },
});

const EvaluationPDF = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Assessment Report</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Candidate Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{data?.Name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data?.Email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Applied Position:</Text>
            <Text style={styles.value}>{data?.["Applied Position"]}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Experience:</Text>
            <Text style={styles.value}>{data?.Experience}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{data?.Phone}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.text}>{data?.Summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Performance</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreTitle}>Completeness Score</Text>
              <Text style={styles.scoreValue}>
                {data?.summary?.Over_all_Completeness_Score}
              </Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreTitle}>Correctness Score</Text>
              <Text style={styles.scoreValue}>
                {data?.summary?.Over_all_Correctness_Score}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>Completeness Analysis</Text>
            <Text style={styles.text}>{data?.summary?.Completeness}</Text>
          </View>
          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>Correctness Analysis</Text>
            <Text style={styles.text}>{data?.summary?.Correctness}</Text>
          </View>
        </View>

        <View style={styles.sectionAnalysis} wrap={false}>
          <Text style={styles.sectionTitle}>Question Analysis</Text>
          <View style={styles.questionTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>
                Question
              </Text>
              <Text style={styles.tableHeaderCell}>Correctness</Text>
              <Text style={styles.tableHeaderCell}>Marks</Text>
            </View>
            {Object.entries(data?.detailed_report || {}).map(
              ([question, details], index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {question}
                  </Text>
                  <Text style={styles.tableCell}>{details?.Correctness}</Text>
                  <Text style={styles.tableCell}>
                    {details?.Marks_Obtained}/{details?.Maximum_Marks}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default EvaluationPDF;
