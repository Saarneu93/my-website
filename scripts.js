// Initialize data
let candidates = JSON.parse(localStorage.getItem('candidates')) || initialCandidates;
let votes = JSON.parse(localStorage.getItem('votes')) || [];
let loggedInUser = localStorage.getItem('loggedInUser') || null;

// Stub functions (remove these once implemented)
function displayCandidates() { console.log("displayCandidates called"); }
function displayAnalytics() { console.log("displayAnalytics called"); }
function displayCandidateInfo() { console.log("displayCandidateInfo called"); }

// Function to load a component into a container
function loadComponent(url, containerId) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(containerId).innerHTML = data;
        })
        .catch(error => console.error(`Error loading ${url}:`, error));
}

// Load header and footer dynamically
loadComponent('header.html', 'header-container');
loadComponent('footer.html', 'footer-container');

let chart;  // Global variable to hold the chart instance

function displayTopCandidatesChart() {
    const canvas = document.getElementById('top-candidates-chart');
    if (!canvas) {
        console.error('Canvas element with id "top-candidates-chart" not found.');
        return;
    }
    const ctx = canvas.getContext('2d');
    
    const sortedCandidates = [...candidates]
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 10);
    
    const labels = sortedCandidates.map(candidate => candidate.name);
    const voteCounts = sortedCandidates.map(candidate => candidate.votes);

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = voteCounts;
        chart.update();
    } else {
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Votes',
                    data: voteCounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const addUserForm = document.getElementById('addUserForm');
    const userNameInput = document.getElementById('userName');
    const userDescInput = document.getElementById('userDesc');
    const listTab = document.getElementById('list-tab');
    const navTabContent = document.getElementById('nav-tabContent');
  
    let tabCount = 1; // Counter for unique IDs

    if (addUserForm) {
        addUserForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const name = userNameInput.value.trim();
            const desc = userDescInput.value.trim();
            if (!name || !desc) return;

            // Create unique tab and content panel IDs
            const tabId = `list-user-${tabCount}`;
            const tabPaneId = `tab-pane-${tabCount}`;
            tabCount++;

            // Create new tab button
            const newTab = document.createElement('a');
            newTab.className = 'list-group-item list-group-item-action';
            newTab.id = `${tabId}-list`;
            newTab.setAttribute('data-bs-toggle', 'list');
            newTab.href = `#${tabPaneId}`;
            newTab.setAttribute('role', 'tab');
            newTab.setAttribute('aria-controls', tabPaneId);
            newTab.textContent = name;

            // Create new tab content pane
            const newPane = document.createElement('div');
            newPane.className = 'tab-pane fade';
            newPane.id = tabPaneId;
            newPane.setAttribute('role', 'tabpanel');
            newPane.setAttribute('aria-labelledby', `${tabId}-list`);
            newPane.innerHTML = `<p>${desc}</p>`;

            // Append new tab and content pane
            listTab.appendChild(newTab);
            navTabContent.appendChild(newPane);

            // Reset form after submission
            addUserForm.reset();

            // Remove active classes from previous selections
            document.querySelectorAll('#list-tab .active').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('#nav-tabContent .active').forEach(item => item.classList.remove('active', 'show'));

            // Activate new tab and content pane
            newTab.classList.add('active');
            newPane.classList.add('active', 'show');
        });
    }

    // Ensure elements exist before trying to update their display
    const votingMessage = document.getElementById('voting-message');
    const candidateList = document.getElementById('candidate-list');
    const voteButton = document.getElementById('vote-button');

    if (votingMessage && candidateList && voteButton) {
        if (loggedInUser) {
            votingMessage.style.display = 'none';
            candidateList.style.display = 'block';
            voteButton.style.display = 'block';
        } else {
            votingMessage.style.display = 'block';
            candidateList.style.display = 'none';
            voteButton.style.display = 'none';
        }
    }

    // Ensure UI updates properly
    updateLoginDisplay();
    updateVotingUI();

    // Call other functions (ensure they are defined before calling)
    if (typeof displayCandidates === "function") displayCandidates();
    if (typeof displayVoteLogs === "function") displayVoteLogs();
    if (typeof displayCandidateVotesList === "function") displayCandidateVotesList();
    if (typeof displayTopCandidatesChart === "function") displayTopCandidatesChart();
    if (typeof displayAnalytics === "function") displayAnalytics();
});

  
function submitVote() {
    if (!loggedInUser) {
        alert("Please log in to vote.");
        return;
    }
  
    const selectedCandidate = document.querySelector('input[name="candidate"]:checked');
    if (selectedCandidate) {
        const candidateIndex = selectedCandidate.value;
        candidates[candidateIndex].votes++;
      
        const voteLog = {
            voter: loggedInUser,
            candidate: candidates[candidateIndex].name,
            date: new Date().toLocaleString()
        };
        votes.push(voteLog);
  
        localStorage.setItem('candidates', JSON.stringify(candidates));
        localStorage.setItem('votes', JSON.stringify(votes));
  
        displayVoteLogs();
        displayCandidateVotesList();
        displayCandidateInfo();  // Stubbed; define if needed
        alert("Vote submitted!");
    } else {
        alert("Please select a candidate.");
    }
  
    displayTopCandidatesChart();
    displayAnalytics();
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
  
function displayCandidateVotesList() {
    const candidateVotesListContainer = document.getElementById("candidate-votes-list-container");
    if (!candidateVotesListContainer) return;
    candidateVotesListContainer.innerHTML = "";
  
    const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
    sortedCandidates.forEach(candidate => {
        const candidateDiv = document.createElement("div");
        candidateDiv.textContent = `${candidate.name}: ${candidate.votes} votes`;
        candidateVotesListContainer.appendChild(candidateDiv);
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

function displayCandidates() {
    const candidateList = document.getElementById("candidate-list");
    if (!candidateList) return;
    candidateList.innerHTML = "";
    
    candidates.forEach((candidate, index) => {
      const candidateDiv = document.createElement("div");
      candidateDiv.className = "form-check mb-2";
      candidateDiv.innerHTML = `
        <input class="form-check-input" type="radio" name="candidate" value="${index}" id="candidate-${index}">
        <label class="form-check-label" for="candidate-${index}">
          ${candidate.name}
        </label>
      `;
      candidateList.appendChild(candidateDiv);
    });
  }

  function login() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    if (username) {
      localStorage.setItem("loggedInUser", username); // Save user
      updateLoginDisplay();
      alert("Logged in as " + username);
      location.reload(); // Force refresh to update navbar
    } else {
      alert("Please enter a username.");
    }
  }
  

  function logout() {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    updateLoginDisplay();
    updateVotingUI(); // immediately hide voting options
    alert("Logged out.");
  }
  

function updateLoginDisplay() {
  const loginForm = document.getElementById('login-form');
  const loggedInInfo = document.getElementById('logged-in-info');
  const loggedUser = document.getElementById('logged-user');

  if (loggedInUser) {
    loginForm.style.display = 'none';
    loggedInInfo.style.display = 'block';
    loggedUser.textContent = "Logged as " + loggedInUser;
  } else {
    loginForm.style.display = 'block';
    loggedInInfo.style.display = 'none';
  }
}
  
function updateVotingUI() {
    const votingMessage = document.getElementById('voting-message');
    const candidateList = document.getElementById('candidate-list');
    const voteButton = document.getElementById('vote-button');
    
    if (loggedInUser) {
      votingMessage.style.display = 'none';
      candidateList.style.display = 'block';
      voteButton.style.display = 'block';
      // Also update candidate list if needed:
      displayCandidates();
    } else {
      votingMessage.style.display = 'block';
      candidateList.style.display = 'none';
      voteButton.style.display = 'none';
    }
  }
  
  // Smooth scrolling for navbar links
document.querySelectorAll('a.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1); // remove the '#' from the href
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 20, // adjust offset if needed
          behavior: 'smooth'
        });
      }
    });
  });
  
  window.updateCandidatesFromAdmin = function(updatedCandidates) {
    // Update the candidates array in index.html
    candidates = updatedCandidates;

    // Update the candidate display on the main page
    if (typeof displayCandidates === "function") {
        displayCandidates();
    }
    if (typeof displayCandidateVotesList === "function") {
      displayCandidateVotesList();
    }
    if (typeof displayTopCandidatesChart === "function") {
        displayTopCandidatesChart();
    }
};