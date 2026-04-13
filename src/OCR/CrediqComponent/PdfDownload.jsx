import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";

import NotoSans from "../utils/NotoSans-Regular.ttf";
import NotoSansDevanagari from "../utils/NotoSansDevanagari-Regular.ttf";
import SolaimanLipi from "../utils/SolaimanLipi.ttf";

Font.register({
  family: "NotoSans",
  src: NotoSans,
});

Font.register({
  family: "NotoSansDevanagari",
  src: NotoSansDevanagari,
});

Font.register({
  family: "SolaimanLipi",
  src: SolaimanLipi,
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "NotoSans",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
    borderBottom: "1px solid #eee",
    paddingBottom: 10,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    border: "1px solid #eee",
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#1e40af",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "30%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f8fafc",
    padding: 5,
  },
  tableCol: {
    width: "70%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 5,
  },
  textHeader: {
    fontSize: 12,
    fontWeight: "bold",
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  arrayItem: {
    marginBottom: 4,
    paddingLeft: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletPoint: {
    width: 10,
    paddingRight: 5,
  },
});

const getFontFamily = (text) => {
  if (/[\u0980-\u09FF]/.test(text)) {
    return "SolaimanLipi";
  } else if (/[\u0900-\u097F]/.test(text)) {
    return "NotoSansDevanagari";
  } else {
    return "NotoSans";
  }
};

const formatKey = (key) => {
  if (!key) return "";
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const renderPdfValue = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).length === 0
  ) {
    return <Text style={styles.text}>N/A</Text>;
  }

  if (Array.isArray(value)) {
    return (
      <View>
        {value.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.bulletPoint}>
              <Text style={styles.text}>•</Text>
            </View>
            <View>{renderPdfValue(item)}</View>
          </View>
        ))}
      </View>
    );
  }

  if (typeof value === "object") {
    return (
      <View style={styles.table}>
        {Object.entries(value).map(([subKey, subValue], i) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.textHeader}>{formatKey(subKey)}</Text>
            </View>
            <View style={styles.tableCol}>{renderPdfValue(subValue)}</View>
          </View>
        ))}
      </View>
    );
  }

  const str = value.toString();

  if (str.includes("•Category")) {
    const bullets = str.split("•").filter(Boolean);

    return (
      <View>
        {bullets.map((bullet, idx) => {
          const categoryMatch = bullet.match(/Category\s*([^\s]+|[^A-Z]+)/);
          const amountMatch = bullet.match(/Amount₹[\d,]+\.\d{2}/);

          return (
            <View key={idx} style={styles.listItem}>
              <Text style={styles.text}>
                • {categoryMatch ? `Category: ${categoryMatch[1]}` : ""}
              </Text>
              {amountMatch && (
                <Text style={[styles.text, { paddingLeft: 10 }]}>
                  {amountMatch[0]}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  }

  if (str.includes("•Date") && str.includes("Amount")) {
    const bullets = str.split("•").filter(Boolean);

    return (
      <View>
        {bullets.map((bullet, idx) => {
          const dateMatch = bullet.match(/Date(\d{2}-\d{2}-\d{4})/);
          const amountMatch = bullet.match(/Amount(₹[\d,]+\.\d{2})/);
          const detailsMatch = bullet.match(/Details(.*)/);

          return (
            <View key={idx} style={styles.listItem}>
              <Text style={styles.text}>• Date: {dateMatch?.[1] || "N/A"}</Text>
              <Text style={[styles.text, { paddingLeft: 10 }]}>
                Amount: {amountMatch?.[1] || "N/A"}
              </Text>
              {detailsMatch?.[1] && (
                <Text style={[styles.text, { paddingLeft: 10 }]}>
                  Details: {detailsMatch[1].trim()}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  }

  // return <Text style={styles.text}>{str}</Text>;
  return (
    <Text style={{ ...styles.text, fontFamily: getFontFamily(str) }}>
      {str}
    </Text>
  );
};

const PdfDownload = ({ data, responseType }) => {
  const renderContent = () => {
    if (!data?.response?.body) return <Text>No data available</Text>;

    const bodyData = data.response.body;

    if (responseType === "Loan Application") {
      return Object.entries(bodyData).map(
        ([parentKey, parentChildren], idx) => (
          <View key={idx} style={[styles.section, { marginBottom: 30 }]}>
            <Text style={styles.sectionTitle}>{parentKey}</Text>
            <View style={styles.table}>
              {Object.entries(parentChildren).map(
                ([childKey, childValue], i) => (
                  <View key={i} style={styles.tableRow}>
                    <View style={styles.tableColHeader}>
                      <Text style={styles.textHeader}>
                        {formatKey(childKey)}
                      </Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.text}>
                        {renderPdfValue(childValue)}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          </View>
        )
      );
    }

    if (responseType === "identity_card") {
      const flattenData = (obj, prefix = "") => {
        return Object.keys(obj).reduce((acc, key) => {
          const prefixedKey = prefix ? `${prefix}_${key}` : key;
          if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            Object.assign(acc, flattenData(obj[key], prefixedKey));
          } else {
            acc[prefixedKey] =
              typeof obj[key] === "boolean" ? obj[key].toString() : obj[key];
          }
          return acc;
        }, {});
      };

      const flattenedData = flattenData(bodyData);
      const keys = Object.keys(flattenedData);

      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ID Details</Text>
          <View style={styles.table}>
            {keys.map((key) => (
              <View key={key} style={styles.tableRow}>
                <View style={styles.tableColHeader}>
                  <Text style={styles.textHeader}>{formatKey(key)}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.text}>
                    {Array.isArray(flattenedData[key])
                      ? flattenedData[key].join(", ")
                      : flattenedData[key] || "N/A"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (responseType === "bank_statement" || responseType === "cdsl_report") {
      return Object.entries(bodyData).map(([sectionKey, sectionValue], idx) => {
        if (
          !sectionValue ||
          (typeof sectionValue === "object" &&
            Object.keys(sectionValue).length === 0)
        ) {
          return null;
        }

        return (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{formatKey(sectionKey)}</Text>
            {Array.isArray(sectionValue)
              ? sectionValue.map((item, i) => (
                  <View key={i} style={{ marginBottom: 15 }}>
                    {renderPdfValue(item)}
                  </View>
                ))
              : renderPdfValue(sectionValue)}
          </View>
        );
      });
    }

    if (responseType === "invoice") {
      const extractedContent =
        bodyData?.output?.results?.[0]?.extracted_content || [];
      return extractedContent.map((item, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {item.ctype === "text" ? "Invoice Summary" : "Invoice Breakdown"}
          </Text>
          {item.ctype === "text" ? (
            <Text style={styles.text}>{item.content}</Text>
          ) : (
            <View style={styles.table}>
              {Object.entries(item.content).map(([key, value], i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={styles.tableColHeader}>
                    <Text style={styles.textHeader}>{formatKey(key)}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{renderPdfValue(value)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ));
    }

    if (responseType === "ocr_all_documents") {
      const documents = bodyData?.output?.results || [];

      if (documents.length === 0) {
        return (
          <View style={styles.section}>
            <Text style={styles.text}>No document content available.</Text>
          </View>
        );
      }

      return (
        <View>
          {documents.map((doc, docIndex) => {
            const content = doc?.document?.content || [];

            if (content.length === 0) return null;

            return (
              <View key={docIndex} style={{ marginBottom: 20 }}>
                {/* Title */}
                {doc.document.title && (
                  <Text
                    style={[
                      styles.title,
                      {
                        marginBottom: 10,
                        fontFamily: getFontFamily(doc.document.title),
                      },
                    ]}
                  >
                    {doc.document.title}
                  </Text>
                )}

                {/* Content */}
                {content.map((block, blockIndex) => {
                  switch (block.type) {
                    case "heading":
                      const headingFontSize =
                        20 - Math.min(block.level || 1, 4) * 2;
                      return (
                        <View
                          key={`${docIndex}-${blockIndex}`}
                          style={{ marginTop: 10, marginBottom: 5 }}
                        >
                          <Text
                            style={[
                              styles.sectionTitle,
                              {
                                fontSize: headingFontSize,
                                fontFamily: getFontFamily(block.text),
                              },
                            ]}
                          >
                            {block.text}
                          </Text>
                        </View>
                      );

                    case "paragraph":
                    case "handwritten":
                      return (
                        <View
                          key={`${docIndex}-${blockIndex}`}
                          style={{ marginBottom: 8 }}
                        >
                          {/* <Text style={styles.text}>{block.text}</Text> */}
                          <Text
                            style={{
                              ...styles.text,
                              fontFamily: getFontFamily(block.text),
                            }}
                          >
                            {block.text}
                          </Text>
                        </View>
                      );

                    case "form_field":
                      return (
                        <View
                          key={`${docIndex}-${blockIndex}`}
                          style={{ marginBottom: 10 }}
                        >
                          <Text
                            style={[
                              styles.text,
                              {
                                fontWeight: "bold",
                                marginBottom: 4,
                                fontFamily: getFontFamily(block.label),
                              },
                            ]}
                          >
                            {block.label}
                          </Text>
                          <Text
                            style={{
                              ...styles.text,
                              fontFamily: getFontFamily(block.value || "N/A"),
                            }}
                          >
                            {block.value || "N/A"}
                          </Text>
                        </View>
                      );

                    case "list":
                      return (
                        <View
                          key={`${docIndex}-${blockIndex}`}
                          style={{ marginBottom: 10, paddingLeft: 10 }}
                        >
                          {block.items.map((item, idx) => (
                            <View key={idx} style={{ flexDirection: "row" }}>
                              <Text style={styles.text}>• </Text>
                              <Text
                                style={{
                                  ...styles.text,
                                  fontFamily: getFontFamily(item),
                                }}
                              >
                                {item.replace(/^\*/, "").trim()}
                              </Text>
                            </View>
                          ))}
                        </View>
                      );

                    case "table":
                      return (
                        <View
                          key={`${docIndex}-${blockIndex}`}
                          style={{ marginBottom: 15 }}
                        >
                          <View style={styles.table}>
                            {/* Header Row */}
                            <View style={styles.tableRow}>
                              {block.headers.map((header, i) => (
                                <View
                                  key={i}
                                  style={[
                                    styles.tableColHeader,
                                    { width: `${100 / block.headers.length}%` },
                                  ]}
                                >
                                  <Text
                                    style={{
                                      ...styles.textHeader,
                                      fontFamily: getFontFamily(header),
                                    }}
                                  >
                                    {header}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            {/* Table Rows */}
                            {block.rows.map((row, rowIndex) => (
                              <View key={rowIndex} style={styles.tableRow}>
                                {row.map((cell, cellIndex) => (
                                  <View
                                    key={cellIndex}
                                    style={[
                                      styles.tableCol,
                                      {
                                        width: `${100 / block.headers.length}%`,
                                      },
                                    ]}
                                  >
                                    <Text
                                      style={{
                                        ...styles.text,
                                        fontFamily: getFontFamily(cell),
                                      }}
                                    >
                                      {cell}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            ))}
                          </View>
                        </View>
                      );

                    default:
                      return null;
                  }
                })}
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <View>
        {Object.entries(bodyData).map(([key, value], idx) => (
          <View key={idx} style={[styles.section, { marginBottom: 30 }]}>
            <Text style={styles.sectionTitle}>{formatKey(key)}</Text>
            {renderPdfValue(value)}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A3" style={styles.page}>
        <Text style={styles.title}>{formatKey(responseType)} Report</Text>
        {renderContent()}
      </Page>
    </Document>
  );
};

export default PdfDownload;
