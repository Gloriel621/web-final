
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
document.addEventListener('DOMContentLoaded', loadSavedPapers);


function displayPaperDetails(paperId) {
    currentPaperId = paperId;
    fetch(`/get_paper_details/${paperId}`)
        .then(response => response.json())
        .then(paperDetails => {
            // Display the abstract or general summary
            document.getElementById('Abstract').innerHTML = paperDetails.abstract ? `<p>${paperDetails.abstract}</p>` : "<p>No abstract available.</p>";

            // Display Key Findings, Methodology, and Related Work
            document.getElementById('KeyFindings').innerHTML = paperDetails.key_findings ? `<p>${paperDetails.key_findings}</p>` : "<p>Run AI to get a summary.</p>";
            document.getElementById('Methodology').innerHTML = paperDetails.methodology ? `<p>${paperDetails.methodology}</p>` : "<p>Run AI to get a summary.</p>";
            document.getElementById('RelatedWork').innerHTML = paperDetails.related_work ? `<p>${paperDetails.related_work}</p>` : "<p>Run AI to get a summary.</p>";
        })
        .catch(error => {
            console.error('Error fetching paper details:', error);
        });

    // Highlight the active paper in the list
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

                    activePaperElement.remove();
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
    var createSummaryButton = this;
    if (currentPaperId) {
        createSummaryButton.disabled = true;
        createSummaryButton.classList.add('button-disabled');
        createSummaryButton.textContent = 'Generating summaries...';

        fetch(`/api/summarize_paper/${currentPaperId}`)
            .then(response => response.json())
            .then(data => {
                if(data.summaries && data.summaries.length === 3) {

                    document.getElementById('KeyFindings').innerHTML = data.summaries[0] || "<p>Key findings not available.</p>";
                    document.getElementById('Methodology').innerHTML = data.summaries[1] || "<p>Methodology not available.</p>";
                    document.getElementById('RelatedWork').innerHTML = data.summaries[2] || "<p>Related work not available.</p>";


                    if (confirm('Summaries generated. Would you like to save them now?')) {
                        saveSummariesToDatabase(currentPaperId, {
                            keyFindings: data.summaries[0],
                            methodology: data.summaries[1],
                            relatedWork: data.summaries[2]
                        });
                    }
                } else {
                    console.error('Error:', data.error);
                    alert('Unable to generate summaries. Please try again.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while fetching the summary.');
            })
            .finally(() => {
                createSummaryButton.disabled = false;
                createSummaryButton.classList.remove('button-disabled');
                createSummaryButton.textContent = 'Create Summary using AI';
            });
    } else {
        alert('Please select a paper to summarize.');
    }
});


function saveSummariesToDatabase(paperId, summaries) {
    fetch(`/save_summary/${paperId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(summaries),
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

