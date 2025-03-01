// Sidebar Toggle
document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("wrapper").classList.toggle("toggled");
});

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const wrapper = document.getElementById("wrapper");
  const adminContent = document.getElementById("admin-content");
  const navLinks = document.querySelectorAll(".list-group-item[data-page]");

  // Ensure elements exist before adding event listeners
  if (menuToggle) {
      menuToggle.addEventListener("click", function () {
          document.getElementById("wrapper").classList.toggle("toggled");
      });
  } else {
      console.error("❌ Error: menu-toggle button not found!");
  }

  if (!adminContent) {
      console.error("🚨 Admin content container not found!");
      return;
  }

  // Function to Load Page Content
  function loadPage(page) {
      fetch(page)
          .then(response => response.text())
          .then(html => {
              adminContent.innerHTML = html;
              // Run the table script AFTER the HTML is loaded
              if (page === "manage-candidates.html") {
                  setupCandidatesTable();
              } else if (page === "vote-logs.html") {
                  setupVoteLogsTable();
              }
          })
          .catch(error => console.error("🚨 Error loading page:", error));
  }

  // Load Default Page (Dashboard)
  loadPage("dashboard.html");

  // Handle Sidebar Navigation Clicks
  navLinks.forEach(link => {
      link.addEventListener("click", function (e) {
          e.preventDefault();
          const page = this.getAttribute("data-page");
          loadPage(page);
      });
  });
});

// Logout Function
function logout() {
  localStorage.removeItem("loggedInUser");
  alert("You have been logged out.");
  window.location.href = "../index.html"; // Redirect to main site
}

function setupCandidatesTable() {
  // Load candidates from localStorage or use initialCandidates
  let candidates = JSON.parse(localStorage.getItem('candidates'));

  // If localStorage is empty, load initialCandidates and save to localStorage
  if (!candidates) {
      if (typeof initialCandidates !== 'undefined' && Array.isArray(initialCandidates)) {
          candidates = initialCandidates;
          localStorage.setItem('candidates', JSON.stringify(candidates));
      } else {
          console.error("Candidates data not loaded or is invalid.");
          return;
      }
  }

  const tableBody = document.getElementById("candidates-body");
  const paginationContainer = document.getElementById("pagination");
  const rowLimitSelect = document.getElementById("rowLimit");
  const addCandidateForm = document.getElementById("addCandidateForm");

  let rowsPerPage = parseInt(rowLimitSelect.value);
  let currentPage = 1;

  function displayCandidates() {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedCandidates = candidates.slice(start, end);

    if (paginatedCandidates && paginatedCandidates.length > 0) {
        paginatedCandidates.forEach((candidate, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${start + index + 1}</td>
                <td>${candidate.name}</td>
                <td>${candidate.email}</td>
                <td>${candidate.phone}</td>
                <td><button class="btn btn-danger btn-sm delete-candidate" data-index="${start + index}">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        tableBody.innerHTML = "<tr><td colspan='5'>No candidates found.</td></tr>";
    }

    updatePagination();

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-candidate').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            if (confirm("Are you sure you want to delete this candidate?")) {
                deleteCandidate(index);
            }
        });
    });
}

  function deleteCandidate(index) {
      candidates.splice(index, 1);
      localStorage.setItem('candidates', JSON.stringify(candidates));
      displayCandidates();
      updateMainPageCandidates(candidates);
  }

  function updatePagination() {
      if (!paginationContainer) return;
      paginationContainer.innerHTML = "";
      const totalPages = Math.ceil(candidates.length / rowsPerPage); // Use 'candidates' here

      // Previous Button
      const prevLi = document.createElement("li");
      prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
      prevLi.innerHTML = `<a class="page-link" href="#">Previous</a>`;
      prevLi.addEventListener("click", function (e) {
          e.preventDefault();
          if (currentPage > 1) {
              currentPage--;
              displayCandidates();
          }
      });
      paginationContainer.appendChild(prevLi);

      // Numbered Buttons
      for (let i = 1; i <= totalPages; i++) {
          const li = document.createElement("li");
          li.className = `page-item ${i === currentPage ? "active" : ""}`;
          li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
          li.addEventListener("click", function (e) {
              e.preventDefault();
              currentPage = i;
              displayCandidates();
          });
          paginationContainer.appendChild(li);
      }

      // Next Button
      const nextLi = document.createElement("li");
      nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
      nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
      nextLi.addEventListener("click", function (e) {
          e.preventDefault();
          if (currentPage < totalPages) {
              currentPage++;
              displayCandidates();
          }
      });
      paginationContainer.appendChild(nextLi);
  }

  if (rowLimitSelect) {
      rowLimitSelect.addEventListener("change", function () {
          rowsPerPage = parseInt(this.value);
          currentPage = 1;
          displayCandidates();
      });
  }

  displayCandidates();

  if (addCandidateForm) {
      addCandidateForm.addEventListener("submit", function (e) {
          e.preventDefault();
          const fullName = document.getElementById("fullName").value;
          const email = document.getElementById("email").value;
          const phone = document.getElementById("phone").value;

          const newCandidate = {
              name: fullName,
              email: email,
              phone: phone,
              votes: 0
          };

          candidates.push(newCandidate);
          localStorage.setItem('candidates', JSON.stringify(candidates));
          displayCandidates();
          document.getElementById("addCandidateModal").classList.remove("show");
          document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());

          addCandidateForm.reset();
          updateMainPageCandidates(candidates);
      });
  }
}

function updateMainPageCandidates(updatedCandidates) {
  if (typeof window.updateCandidatesFromAdmin === 'function') {
      window.updateCandidatesFromAdmin(updatedCandidates);
  } else {
      console.error("Main page update function not found.");
  }
}

function displayVoteLogs() {
  const logList = document.getElementById("log-list");
  if (!logList) return;
  logList.innerHTML = "";

  votes.forEach(log => {
      const logItem = document.createElement("div");
      logItem.textContent = `${log.date}: ${log.voter} voted for ${log.candidate}`;
      logList.appendChild(logItem);
  });
}

function exportLogsToText() {
  let logText = "";
  votes.forEach(log => {
      logText += `${log.date}: ${log.voter} voted for ${log.candidate}\n`;
  });

  const blob = new Blob([logText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'vote_logs.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function setupVoteLogsTable() {
  const tableBody = document.getElementById("vote-logs-body");
  const paginationContainer = document.getElementById("pagination");
  const rowLimitSelect = document.getElementById("rowLimit");

  if (!tableBody || !paginationContainer || !rowLimitSelect) {
      console.error("Required elements not found in vote-logs.html");
      return;
  }

  let rowsPerPage = parseInt(rowLimitSelect.value);
  let currentPage = 1;

  function displayVoteLogs() {
      tableBody.innerHTML = ""; // Clear existing table data

      const start = (currentPage - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedLogs = votes.slice(start, end);

      paginatedLogs.forEach((log, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${start + index + 1}</td>
              <td>${log.voter}</td>
              <td>${log.candidate}</td>
              <td>${log.date}</td>
          `;
          tableBody.appendChild(row);
      });

      updatePagination();
  }

  function updatePagination() {
      paginationContainer.innerHTML = "";
      const totalPages = Math.ceil(votes.length / rowsPerPage);

      // Previous Button
      const prevLi = document.createElement("li");
      prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
      prevLi.innerHTML = `<a class="page-link" href="#">Previous</a>`;
      prevLi.addEventListener("click", function (e) {
          e.preventDefault();
          if (currentPage > 1) {
              currentPage--;
              displayVoteLogs();
          }
      });
      paginationContainer.appendChild(prevLi);

      // Numbered Buttons
      for (let i = 1; i <= totalPages; i++) {
          const li = document.createElement("li");
          li.className = `page-item ${i === currentPage ? "active" : ""}`;
          li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
          li.addEventListener("click", function (e) {
              e.preventDefault();
              currentPage = i;
              displayVoteLogs();
          });
          paginationContainer.appendChild(li);
      }

      // Next Button
      const nextLi = document.createElement("li");
      nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
      nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
      nextLi.addEventListener("click", function (e) {
          e.preventDefault();
          if (currentPage < totalPages) {
              currentPage++;
              displayVoteLogs();
          }
      });
      paginationContainer.appendChild(nextLi);
  }

  rowLimitSelect.addEventListener("change", function () {
      rowsPerPage = parseInt(this.value);
      currentPage = 1;
      displayVoteLogs();
  });

  displayVoteLogs();
}


function downloadLogs() {
  // Fetch the vote logs data from the votes array
  let logText = "Timestamp,Voter,Candidate\n"; // Header row

  votes.forEach(log => {
      logText += `${log.date},${log.voter},${log.candidate}\n`;
  });

  // Create a download link
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logText));
  element.setAttribute('download', 'vote_logs.txt');

  // Trigger the download
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Modify loadPage to call setupVoteLogsTable
function loadPage(page) {
  fetch(page)
      .then(response => response.text())
      .then(html => {
          adminContent.innerHTML = html;
          if (page === "manage-candidates.html") {
              setupCandidatesTable();
          } else if (page === "vote-logs.html") {
              setupVoteLogsTable(); // Call the new function
          }
      })
      .catch(error => console.error("🚨 Error loading page:", error));
}
