document.addEventListener('DOMContentLoaded', () => {
  const csvFileInput = document.getElementById('csvFileInput');
  const generateReportBtn = document.getElementById('generateReportBtn');
  const fileError = document.getElementById('fileError');
  const reportContainer = document.getElementById('reportContainer');
  const reportTableBody = document.getElementById('reportTableBody');
  const totalReachElem = document.getElementById('totalReach');
  const totalImpressionsElem = document.getElementById('totalImpressions');
  const totalClicksElem = document.getElementById('totalClicks');
  const campaignNameElem = document.getElementById('campaignName');
  const reportingPeriodElem = document.getElementById('reportingPeriod');
  const summaryReachElem = document.querySelector('.summary-reach');
  const summaryImpressionsElem = document.querySelector('.summary-impressions');
  const summaryClicksElem = document.querySelector('.summary-clicks');
  const currentDateElem = document.getElementById('currentDate');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');

  let reportChart; // To store the Chart.js instance

  // Set current date
  currentDateElem.textContent = new Date().toISOString().slice(0, 10);

  csvFileInput.addEventListener('change', () => {
    if (csvFileInput.files.length > 0) {
      generateReportBtn.disabled = false;
      fileError.textContent = '';
    } else {
      generateReportBtn.disabled = true;
    }
  });

  generateReportBtn.addEventListener('click', () => {
    const file = csvFileInput.files[0];
    if (file) {
      parseCSV(file);
    } else {
      fileError.textContent = 'Please select a CSV file to upload.';
    }
  });

  downloadPdfBtn.addEventListener('click', generatePdf);

  function parseCSV(file) {
    PapaParse.parse(file, {
      header: true, // Assuming the first row is headers
      dynamicTyping: true, // Automatically convert numbers, etc.
      skipEmptyLines: true,
      complete: function(results) {
        if (results.errors.length) {
          fileError.textContent = 'Error parsing CSV: ' + results.errors[0].message;
          reportContainer.style.display = 'none';
          return;
        }

        const data = results.data;
        if (data.length === 0) {
          fileError.textContent = 'CSV file is empty or contains no valid data.';
          reportContainer.style.display = 'none';
          return;
        }

        // Validate expected columns based on your provided CSV sample
        const requiredHeaders = ["Reporting starts", "Reporting ends", "Impressions", "Reach", "Clicks (all)", "CTR (all)", "Page engagement"];
        const actualHeaders = Object.keys(data[0]);
        const missingHeaders = requiredHeaders.filter(header => !actualHeaders.includes(header));

        if (missingHeaders.length > 0) {
          fileError.textContent = `Missing required CSV columns: ${missingHeaders.join(', ')}. Please ensure your CSV has these exact headers.`;
          reportContainer.style.display = 'none';
          return;
        }

        renderReport(data);
        reportContainer.style.display = 'block';
        fileError.textContent = ''; // Clear any previous errors
      },
      error: function(err) {
        fileError.textContent = 'Failed to read CSV file: ' + err.message;
        reportContainer.style.display = 'none';
      }
    });
  }

  function renderReport(data) {
    // Clear previous data
    reportTableBody.innerHTML = '';

    let totalImpressions = 0;
    let totalReach = 0;
    let totalClicks = 0;
    let totalPageEngagement = 0; // New total for Page Engagement

    const dates = []; // We'll use 'Reporting starts' for dates
    const impressionsData = [];
    const reachData = [];
    const clicksData = [];

    // Populate table and collect chart data
    data.forEach(row => {
      // Use the new column names from your CSV sample
      const startDate = row['Reporting starts'];
      const impressions = parseInt(row['Impressions']) || 0;
      const reach = parseInt(row['Reach']) || 0;
      const clicks = parseInt(row['Clicks (all)']) || 0; // Corrected header
      const ctr = parseFloat(row['CTR (all)']) || 0; // Corrected header
      const pageEngagement = parseInt(row['Page engagement']) || 0; // New metric

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${startDate}</td>
        <td>${impressions.toLocaleString()}</td>
        <td>${reach.toLocaleString()}</td>
        <td>${ctr.toFixed(2)}</td>
        <td>${clicks.toLocaleString()}</td>
        <td>${pageEngagement.toLocaleString()}</td> `;
      reportTableBody.appendChild(tr);

      totalImpressions += impressions;
      totalReach += reach;
      totalClicks += clicks;
      totalPageEngagement += pageEngagement; // Accumulate page engagement

      dates.push(startDate);
      impressionsData.push(impressions);
      reachData.push(reach);
      clicksData.push(clicks);
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.classList.add('total-row');
    totalRow.innerHTML = `
      <td>Total</td>
      <td>${totalImpressions.toLocaleString()}</td>
      <td>${totalReach.toLocaleString()}</td>
      <td>-</td>
      <td>${totalClicks.toLocaleString()}</td>
      <td>${totalPageEngagement.toLocaleString()}</td> `;
    reportTableBody.appendChild(totalRow);

    // Update KPIs (Impressions, Reach, Clicks are still the main KPIs)
    totalReachElem.textContent = totalReach.toLocaleString();
    totalImpressionsElem.textContent = totalImpressions.toLocaleString();
    totalClicksElem.textContent = totalClicks.toLocaleString();

    // Update summary paragraph
    summaryReachElem.textContent = totalReach.toLocaleString();
    summaryImpressionsElem.textContent = totalImpressions.toLocaleString();
    summaryClicksElem.textContent = totalClicks.toLocaleString();

    // Set reporting period - use 'Reporting starts' and 'Reporting ends' from the data
    const firstDate = dates.length > 0 ? data[0]['Reporting starts'] : 'N/A';
    const lastDate = dates.length > 0 ? data[data.length - 1]['Reporting ends'] : 'N/A';
    reportingPeriodElem.textContent = `${firstDate} to ${lastDate}`;

    // Render Chart
    renderChart(dates, reachData, clicksData);
  }

  function renderChart(dates, reachData, clicksData) {
    if (reportChart) {
      reportChart.destroy(); // Destroy previous chart instance
    }

    const ctx = document.getElementById('reportChart').getContext('2d');
    const scaleFactor = 30; // Adjust as needed for visual balance between Reach and Clicks bars
    const scaledClicks = clicksData.map(c => c * scaleFactor);

    reportChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Reach',
            data: reachData,
            backgroundColor: '#2b2d42', // space-cadet
            borderRadius: 6,
            barPercentage: 0.8,
            datalabels: {
              display: true,
              color: 'black',
              anchor: 'end',
              align: 'start',
              font: { weight: 'bold', size: 12 },
              formatter: function(value) {
                return value.toLocaleString();
              }
            }
          },
          {
            label: 'Clicks (scaled)',
            data: scaledClicks,
            backgroundColor: '#ef233c', // red-pantone
            borderRadius: 6,
            barPercentage: 0.8,
            datalabels: {
              display: true,
              color: 'black',
              anchor: 'end',
              align: 'start',
              font: { weight: 'bold', size: 12 },
              formatter: function(value, context) {
                return clicksData[context.dataIndex].toLocaleString(); // Show actual clicks
              }
            }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allow custom height
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.1)' }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: {
            labels: { font: { weight: 'bold' } }
          },
          datalabels: {
            display: true
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  async function generatePdf() {
    downloadPdfBtn.textContent = 'Generating PDF...';
    downloadPdfBtn.disabled = true;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    const reportElement = document.getElementById('reportContainer');

    // Temporarily hide editable underlines for better PDF appearance
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.style.borderBottom = 'none';
    });

    await html2canvas(reportElement, {
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Set to true if your logo or other assets are from a different origin
      windowWidth: reportElement.scrollWidth,
      windowHeight: reportElement.scrollHeight
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 595.28; // A4 width in points (210mm @ 72dpi = 595.28pt)
      const pageHeight = 841.89; // A4 height in points (297mm @ 72dpi = 841.89pt)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // If the content is taller than one page, add new pages
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save('facebook_ads_report.pdf');

      // Restore editable underlines
      document.querySelectorAll('[contenteditable="true"]').forEach(el => {
          el.style.borderBottom = '1px dashed var(--cool-gray)';
      });

      downloadPdfBtn.textContent = 'Download Report as PDF';
      downloadPdfBtn.disabled = false;
    });
  }
});