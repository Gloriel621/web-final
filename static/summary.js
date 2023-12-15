
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function openTabOnLoad() {
// Simulate a click on the Abstract tab
document.getElementById('Abstract').style.display = 'block';
var i, tabcontent, tablinks;
tabcontent = document.getElementsByClassName('tab-content');
for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none';
}
tablinks = document.getElementsByClassName('tab-button');
for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
}
// Set the Abstract tab as active
document.querySelector('.tab-button').className += ' active';
document.getElementById('Abstract').style.display = 'block';
  
}
function loadSavedPapers() {
    fetch('/get_saved_papers')
        .then(response => response.json())
        .then(papers => {
            const savedPapersList = document.getElementById('savedPapersList');
            savedPapersList.innerHTML = ''; // Clear existing content

            if (papers.length === 0) {
                // No saved papers, display a message
                const noPapersItem = document.createElement('li');
                noPapersItem.className = 'no-papers-item';
                noPapersItem.textContent = 'There are no saved papers.';
                savedPapersList.appendChild(noPapersItem);
            } else {
                // Display the list of saved papers
                papers.forEach(paper => {
                    const listItem = document.createElement('li');
                    listItem.className = 'paper-item';
                    listItem.textContent = paper.title;
                    listItem.setAttribute('data-paper-id', paper.id); // Set the paper ID as a data attribute
                    listItem.onclick = () => displayPaperDetails(paper.id);
                    savedPapersList.appendChild(listItem);
                });
            }
        })
        .catch(error => {
            console.error('Error loading saved papers:', error);
        });
}


// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadSavedPapers);

function displayPaperDetails(paperId) {
    currentPaperId = paperId;
    fetch(`/get_paper_details/${paperId}`)
        .then(response => response.json())
        .then(paperDetails => {
            const abstractSection = document.getElementById('Abstract');
            abstractSection.innerHTML = `
                <p>${paperDetails.summary}</p>
                <a href="${paperDetails.pdf_link}" target="_blank">View Paper</a>
            `;

            // // Open the Abstract tab
            // openTab(null, 'Abstract');
        })
        .catch(error => {
            console.error('Error fetching paper details:', error);
        });

        const papersListItems = document.querySelectorAll('#savedPapersList .paper-item');
        papersListItems.forEach(item => {
            if(item.getAttribute('data-paper-id') == paperId) {
                item.classList.add('active-paper');
            } else {
                item.classList.remove('active-paper');
            }
        });
}

document.getElementById('deletePaperButton').addEventListener('click', function() {
    const activePaperElement = document.querySelector('.paper-item.active-paper');
    if (activePaperElement) {
        const paperId = activePaperElement.getAttribute('data-paper-id');
        fetch(`/delete_paper/${paperId}`, { method: 'POST' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Remove the paper from the list
                    activePaperElement.remove();
                    // Optionally, clear or update the details section
                } else {
                    alert('Error deleting paper: ' + result.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});

document.getElementById('createSummaryButton').addEventListener('click', function() {
    if (currentPaperId) {
        fetch(`/api/summarize_paper/${currentPaperId}`)
        .then(response => response.json())
        .then(data => {
            if(data.summaries) {
                // Code to display summaries in the respective tabs
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        alert('Please select a paper to summarize.');
    }
});


