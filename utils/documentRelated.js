import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
  VerticalAlign,
} from "docx";

import fs from "fs/promises";
import path from "path";
import { isRevised } from "./functions.js";
class QuotationGenerator {
  constructor() {
    this.imageCache = new Map();
  }

  async loadImage(imagePath) {
    if (this.imageCache.has(imagePath)) {
      return this.imageCache.get(imagePath);
    }
    const imageBuffer = await fs.readFile(imagePath);
    this.imageCache.set(imagePath, imageBuffer);
    return imageBuffer;
  }

  createAddressTable(billTo, shipTo) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: "Bill To:", bold: true }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${billTo.prefix} ${billTo.name}.`,
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({ text: `${billTo.a1},${billTo.a2},` }),
                new Paragraph({ text: `${billTo.a3},` }),
                new Paragraph({ text: `${billTo.a4},` }),
                new Paragraph({ text: `${billTo.city} - ${billTo.pincode},` }),
                new Paragraph({ text: `${billTo.a5}.` }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({ text: "Ship To:", bold: true }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `${shipTo.projectName}.`, bold: true }),
                  ],
                }),
                new Paragraph({ text: `${shipTo.a1} ${shipTo.a2},` }),
                new Paragraph({ text: `${shipTo.a3},` }),
                new Paragraph({ text: `${shipTo.a4},` }),
                new Paragraph({ text: `${shipTo.city} - ${shipTo.pincode},` }),
                new Paragraph({ text: `${shipTo.a5}.` }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
    });
  }

  createInfoRow(label, value) {
    const labelText = new TextRun({ text: label, bold: true });
    let valueContent;

    if (Array.isArray(value)) {
      if (value.length === 1) {
        valueContent = [
          new Paragraph({ children: [new TextRun({ text: value[0] })] }),
        ];
      } else {
        valueContent = value.map(
          (item, index) =>
            new Paragraph({
              children: [new TextRun({ text: `${index + 1}. ${item}` })],
            })
        );
      }
    } else {
      valueContent = [
        new Paragraph({ children: [new TextRun({ text: value })] }),
      ];
    }

    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [labelText] })],
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: valueContent,
          width: { size: 90, type: WidthType.PERCENTAGE },
        }),
      ],
    });
  }

  createInfoTable(data, sL, aL) {
    const paymentTermsArray = data.paymentTerms
      .split(".")
      .filter((v) => v.trim() !== "");
    const commonFields = [
      { label: "Subject:", value: `${data.subject} ${data.shipToAddress.a4}` },
      { label: "Reference:", value: data.reference },
      {
        label: "Treatment Type:",
        value: `${data.treatmentType}  [Sac-code ... 998531]`,
      },
      { label: "Specification:", value: data.specification },
      { label: "Payment Terms:", value: paymentTermsArray },
      { label: "Taxation:", value: data.taxation },
    ];

    const fields =
      data.docType === "supply"
        ? [...commonFields]
        : [
            ...commonFields,
            { label: "Equipment:", value: data.equipments },
            {
              label: "Service Warranty:",
              value:
                "10 Years. In case of subterranean or ground dwelling of termite infestation during the warranty period, we undertake to treat the same and eradicate the termite infestation without any extra cost to you. This warranty will be forwarded on stamp paper.",
            },
          ];

    if (data.note?.trim()) {
      fields.push({ label: "Note:", value: data.note });
    }

    const rows = fields.flatMap((field) => [
      this.createInfoRow(field.label, field.value),
      ...(sL <= 2 && aL <= 5 ? [this.createEmptyRow()] : []),
    ]);

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: rows,
    });
  }

  createEmptyRow() {
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({})] }),
        new TableCell({ children: [new Paragraph({})] }),
      ],
    });
  }
  generateStandardDoc = async (data) => {
    const __dirname = path.resolve();
    try {
      const title = new Paragraph({
        children: [
          new TextRun({
            text: "ANNEXURE",
            bold: true,
            size: 48, // This is the font size, 48 here means 24pt
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      });
      const header = new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: await this.loadImage(
              path.join(__dirname, "../att-quotation/images/header.png")
            ),
            transformation: {
              width: 600,
              height: 75,
            },
          }),
        ],
      });

      const table = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 1000, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "SRNO",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 9500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Description",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Unit",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Area",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Rate",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 3000, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Chemical",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
            ],
          }),
        ],
      });

      data.forEach((item, index) => {
        const row = new TableRow({
          children: [
            new TableCell({
              width: { size: 1000, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `${(index + 1).toString()}`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 9500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: item.description,
                  bold: true,
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: item.workAreaUnit,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: item.workArea,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `Rs ${item.serviceRate + " " + item.serviceRateUnit}`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 3000, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: item.chemical,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
          ],
        });
        table.addChildElement(row);
      });

      // Add an additional row with the specified text aligned to the right
      const additionalRow = new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            children: [
              new Paragraph({
                text: "(+)GST @ 18% As applicable",
                alignment: AlignmentType.LEFT,
                spacing: { before: 200, after: 200 },
              }),
            ],
          }),
        ],
      });
      table.addChildElement(additionalRow);
      return { header, title, table };
    } catch (error) {
      console.log(error);
      throw new Error("Standard BOQ filed");
    }
  };
  generateSupplyDoc = async (data) => {
    try {
      const title = new Paragraph({
        children: [
          new TextRun({
            text: "ANNEXURE",
            bold: true,
            size: 48, // This is the font size, 48 here means 24pt
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      });
      const header = new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: await this.loadImage(
              path.join(__dirname, "../images/header.png")
            ),
            transformation: {
              width: 600,
              height: 75,
            },
          }),
        ],
      });

      const table = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 1000, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "SRNO",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 9500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Description",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Rate",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Quantity",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 3000, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Chemical",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
            ],
          }),
        ],
      });

      data.forEach((item, index) => {
        const row = new TableRow({
          children: [
            new TableCell({
              width: { size: 1000, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `${(index + 1).toString()}`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 9500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: item.description,
                  bold: true,
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `Rs ${item.chemicalRate} ${item.chemicalRateUnit}`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `${item.chemicalQuantity} Ltr`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 3000, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: item.chemical,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
          ],
        });
        table.addChildElement(row);
      });

      // Add an additional row with the specified text aligned to the right
      const additionalRow = new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            children: [
              new Paragraph({
                text: "(+) @ 18% As applicable",
                alignment: AlignmentType.LEFT,
                spacing: { before: 200, after: 200 },
              }),
            ],
          }),
        ],
      });
      table.addChildElement(additionalRow);
      return { header, title, table };
    } catch (error) {
      throw new Error("Supply BOQ filed");
    }
  };
  generateSupplyApplyDoc = async (data) => {
    try {
      const title = new Paragraph({
        children: [
          new TextRun({
            text: "ANNEXURE",
            bold: true,
            size: 48, // This is the font size, 48 here means 24pt
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      });
      const header = new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: await this.loadImage(
              path.join(__dirname, "../images/header.png")
            ),
            transformation: {
              width: 600,
              height: 75,
            },
          }),
        ],
      });

      const table = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 1000, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "SRNO",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 9500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Description",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Work Area",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Apply Rate",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Chemical Qty",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 1500, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Chemical Cost",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
              new TableCell({
                width: { size: 3000, type: WidthType.DXA },
                height: { size: 850, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    text: "Chemical",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                  }),
                ],
                shading: { fill: "D3D3D3" },
              }),
            ],
          }),
        ],
      });

      data.forEach((item, index) => {
        const row = new TableRow({
          children: [
            new TableCell({
              width: { size: 1000, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `${(index + 1).toString()}`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 9500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: item.description,
                  bold: true,
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `${item.workArea} ${item.workAreaUnit}`,
                  bold: true,
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `Rs ${item.applyRate} ${item.applyRateUnit}`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `${item.chemicalQuantity} Ltr`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 1500, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: `Rs ${item.chemicalRate} ${item.chemicalRateUnit}`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),

            new TableCell({
              width: { size: 3000, type: WidthType.DXA },
              children: [
                new Paragraph({
                  text: item.chemical,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                }),
              ],
            }),
          ],
        });
        table.addChildElement(row);
      });

      // Add an additional row with the specified text aligned to the right
      const additionalRow = new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            children: [
              new Paragraph({
                text: "GST @ 18% As applicable",
                alignment: AlignmentType.LEFT,
                spacing: { before: 200, after: 200 },
              }),
            ],
          }),
        ],
      });
      table.addChildElement(additionalRow);
      return { header, title, table };
    } catch (error) {
      throw new Error("SupplyApply BOQ filed");
    }
  };
  createQuoteInfoTableStandard = (quoteInfo) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            "Work Area Type",
            "Work Area",
            "Service Rate",
            "Chemical",
          ].map(
            (header) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: header,
                        bold: true,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: "D3D3D3" },
                verticalAlign: VerticalAlign.CENTER,
              })
          ),
        }),
        ...quoteInfo.map(
          (info) =>
            new TableRow({
              children: [
                info.workAreaType,
                `${info.workArea} ${info.workAreaUnit}`,
                `Rs ${info.serviceRate} ${info.serviceRateUnit}`,
                info.chemical,
              ].map(
                (text) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        text,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                  })
              ),
            })
        ),
      ],
    });
  };
  createQuoteInfoTableApplySupply = (quoteInfo) => {
    const headers = [
      { key: "workAreaType", label: "Work Area Type" },
      { key: "workArea", label: "Work Area" },
      { key: "applyRate", label: "Apply Rate" },
      { key: "chemicalQuantity", label: "Chemical Quantity" },
      { key: "chemicalRate", label: "Chemical Cost" },
      { key: "chemical", label: "Chemical" },
    ];

    // Determine which columns should be included based on the presence of data
    const includedHeaders = headers.filter((header) =>
      quoteInfo.some((info) => info[header.key])
    );

    // Create the table
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: includedHeaders.map(
            (header) =>
              new TableCell({
                children: [new Paragraph({ text: header.label, bold: true })],
                shading: { fill: "D3D3D3" },
              })
          ),
        }),
        ...quoteInfo.map(
          (info) =>
            new TableRow({
              children: includedHeaders.map((header) => {
                let text = info[header.key];

                // Handle special cases for formatting
                if (header.key === "workArea") {
                  text = `${info.workArea} ${info.workAreaUnit}`;
                } else if (header.key === "applyRate" && info.applyRate) {
                  text = `Rs ${info.applyRate} ${info.applyRateUnit}`;
                } else if (header.key === "chemicalQuantity") {
                  text = `${info.chemicalQuantity} Ltr.`;
                } else if (header.key === "chemicalRate" && info.chemicalRate) {
                  text = `Rs ${info.chemicalRate} ${info.chemicalRateUnit}`;
                }

                return new TableCell({
                  children: [new Paragraph({ text: text || "" })],
                });
              }),
            })
        ),
      ],
    });
  };
  createQuoteInfoTableSupply = (quoteInfo) => {
    const headers = [
      { key: "workAreaType", label: "Work Area Type" },
      { key: "chemicalQuantity", label: "Chemical Quantity" },
      { key: "chemicalRate", label: "Chemical Cost" },
      { key: "chemical", label: "Chemical" },
    ];

    // Determine which columns should be included based on the presence of data
    const includedHeaders = headers.filter((header) =>
      quoteInfo.some((info) => info[header.key])
    );

    // Create the table
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: includedHeaders.map(
            (header) =>
              new TableCell({
                children: [new Paragraph({ text: header.label, bold: true })],
                shading: { fill: "D3D3D3" },
              })
          ),
        }),
        ...quoteInfo.map(
          (info) =>
            new TableRow({
              children: includedHeaders.map((header) => {
                let text = info[header.key];

                // Handle special cases for formatting
                if (header.key === "workArea") {
                  text = `${info.workArea} ${info.workAreaUnit}`;
                } else if (header.key === "applyRate" && info.applyRate) {
                  text = `Rs ${info.applyRate} ${info.applyRateUnit}`;
                } else if (header.key === "chemicalQuantity") {
                  text = `${info.chemicalQuantity} Ltr.`;
                } else if (header.key === "chemicalRate" && info.chemicalRate) {
                  text = `Rs ${info.chemicalRate} ${info.chemicalRateUnit}`;
                }

                return new TableCell({
                  children: [new Paragraph({ text: text || "" })],
                });
              }),
            })
        ),
      ],
    });
  };
  saprateQuoteInfo(a1) {
    const array = [...a1];
    const stan = array.filter((a1) => a1.applyRate === null);
    const ApSp = array.filter((a1) => a1.applyRate !== null);
    return [stan, ApSp];
  }

  async generateQuotation(data, annexure = false) {
    const __dirname = path.resolve();
    let standard = [];
    let applySupply = [];
    let supply = [];
    if (data.docType) {
      data.docType === "standard"
        ? (standard = data.quoteInfo)
        : data.docType === "supply/apply"
        ? (applySupply = data.quoteInfo)
        : data.docType === "supply"
        ? (supply = data.quoteInfo)
        : null;
    } else {
      [standard, applySupply] = this.saprateQuoteInfo(data.quoteInfo);
    }
    try {
      const headerImage = await this.loadImage(
        path.join(__dirname, "../att-quotation/images/header.png")
      );
      const footerImage = await this.loadImage(
        path.join(__dirname, "../att-quotation/images/footer.png")
      );
      const stampImage = await this.loadImage(
        path.join(__dirname, "../att-quotation/images/stamp.png")
      );

      const children = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: headerImage,
              transformation: {
                width: 600,
                height: 75,
              },
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [new TextRun({ text: "Quotation", bold: true, size: 24 })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Quotation No: ${
                data.quotationNo ? data.quotationNo : data._id
              }`,
              size: 18,
              bold: true,
            }),
          ],
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Date: ${new Date(data.quotationDate).toLocaleDateString(
                "en-GB"
              )}`,
              size: 18,
              bold: true,
            }),
          ],
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "" }),
        this.createAddressTable(data.billToAddress, data.shipToAddress),
        new Paragraph({ text: "" }),
        ...(data.kindAttention.trim() !== "" && data.kindAttention !== "NA"
          ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Kind Attention: ${data.kindAttentionPrefix} ${data.kindAttention}`,
                    bold: true,
                  }),
                ],
              }),
            ]
          : []),
        new Paragraph({ text: "" }),
        ...(!isRevised(data.quotationNo)
          ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${
                      data.salesPerson.initials === "SALES"
                        ? "We thank you for your enquiry and the opportunity given to us to quote our rates, Further to your instructions, we are pleased to submit our quotation as below"
                        : `We thank for your enquiry & the time given to our Representative ${data.salesPerson.prefix} ${data.salesPerson.username}`
                    }`,
                    bold: true,
                  }),
                ],
              }),
            ]
          : []),
        ...(isRevised(data.quotationNo)
          ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "As per your requirement, submiting our revised offer as below.",
                    bold: true,
                  }),
                ],
              }),
            ]
          : []),
        new Paragraph({ text: "" }),
        this.createInfoTable(data, standard?.length, applySupply?.length),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [new TextRun({ text: "Quote Information:", bold: true })],
        }),
      ];

      if (standard.length > 0) {
        children.push(this.createQuoteInfoTableStandard(standard));
      }
      if (applySupply.length > 0) {
        children.push(new Paragraph({ text: "" }));
        children.push(this.createQuoteInfoTableApplySupply(applySupply));
      }

      if (supply.length > 0) {
        children.push(new Paragraph({ text: "" }));
        children.push(this.createQuoteInfoTableSupply(supply));
      }
      // Add address table, info table, and other content
      children.push(
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({
              text:
                data?.docType === "supply"
                  ? "The offer provided is for product supply as per your requirements provided and we hope you will accept the same and will give us the opportunity to supply."
                  : `We hope you will accept the same and will give us the opportunity to be of service to you.`,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Please call us for clarification if any.`,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Thanking you,`,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Yours faithfully,`,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({
              text: `For EXPRESS PESTICIDES PVT. LTD.`,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new ImageRun({
              data: stampImage,
              transformation: {
                width: 50,
                height: 40,
              },
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Authorized Signatory`,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${data.salesPerson.initials}/${data.createdBy.initials}`,
            }),
          ],
        })
      );
      children.push(
        new Paragraph({ text: "" }), // Add some space before the footer image
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: footerImage,
              transformation: {
                width: 600,
                height: 65,
              },
            }),
          ],
        })
      );
      const { header, title, table } =
        data.docType === "standard"
          ? await this.generateStandardDoc(data.quoteInfo)
          : data.docType === "supply"
          ? await this.generateSupplyDoc(data.quoteInfo)
          : data.docType === "supply/apply"
          ? await this.generateSupplyApplyDoc(data.quoteInfo)
          : null;

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: { font: "Arial" },
            },
          },
        },
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 500,
                  bottom: 500,
                  left: 800,
                  right: 800,
                },
              },
            },
            children: children,
            // Conditionally include the second page if annexure is true
            ...(annexure
              ? [
                  {
                    properties: {
                      page: {
                        margin: {
                          top: 500, // 0.5 cm in twips
                          bottom: 500, // 0.5 cm in twips
                          left: 800, // 1.27 cm in twips
                          right: 800, // 1.27 cm in twips
                        },
                      },
                    },
                    children: [header, title, table],
                  },
                ]
              : []),
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      const fileName = `${data.billToAddress.name}_${
        data.shipToAddress.projectName
      }_${data.shipToAddress.a4}_${data.shipToAddress.city}_${
        data.quotationNo || data._id
      }.docx`;

      return { buffer, fileName };
    } catch (error) {
      throw new Error(`Failed to generate quotation: ${error.message}`);
    }
  }
}

export default QuotationGenerator;
