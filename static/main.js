function searchPapers() {
    var query = document.getElementById('searchInput').value;
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    var researchField = document.getElementById('researchField').value;
    var titleSearch = document.getElementById('titleSearch').value;
    var arxivId = document.getElementById('arxivId').value;
    var numPapers = document.getElementById('numPapers').value;
    var sortBy = document.getElementById('sortBy').value;

    // Construct the query string with the advanced filter options
    var params = {
        query: query,
        start_date: startDate,
        end_date: endDate,
        research_field: researchField,
        title_search: titleSearch,
        arxiv_id: arxivId,
        num_papers: numPapers,
        sort_by: sortBy
    };

    // Filter out empty parameters
    var queryString = Object.keys(params)
        .filter(key => params[key] !== '')
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

    console.log("Query String: ", queryString); // Log the constructed query string

    fetch(`/search?${queryString}`)
        .then(response => {
            console.log("Response: ", response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Data: ", data);
            var results = document.getElementById('results');
            results.innerHTML = ''; // Clear previous results

            if (data.length === 0) {
                results.innerHTML = '<div>No papers found.</div>';
                return;
            }

            data.forEach(paper => {
                var paperDiv = document.createElement('div');
                paperDiv.className = 'paper';

                var titleElement = document.createElement('h3');
                titleElement.textContent = paper.title;
                paperDiv.appendChild(titleElement);

                var saveInAccountButton = document.createElement('button');
                saveInAccountButton.className = 'save-in-account';
                saveInAccountButton.textContent = 'Save Paper in Account';

                // Extract paper ID from the arXiv URL
                var paperId = paper.id.split('/').pop();
                saveInAccountButton.setAttribute('data-paper-id', paperId);
                saveInAccountButton.onclick = function() {
                    savePaperInAccount(paper);
                };
                paperDiv.appendChild(saveInAccountButton);

                var saveAsPdfLink = document.createElement('a');
                saveAsPdfLink.className = 'save-as-pdf';
                saveAsPdfLink.textContent = 'Save Paper as PDF';
                saveAsPdfLink.href = `http://arxiv.org/pdf/${paperId}.pdf`;
                saveAsPdfLink.target = '_blank';
                saveAsPdfLink.download = paper.title.replace(/[^a-zA-Z0-9]/g,'_') + '.pdf';
                paperDiv.appendChild(saveAsPdfLink);

                results.appendChild(paperDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            console.log("Error: ", error.message);
            var results = document.getElementById('results');
            results.innerHTML = `<div>Error fetching data: ${error.message}. Please try again later.</div>`;
        });
}

document.getElementById('searchButton').addEventListener('click', searchPapers);


const researchFieldOptions = {
    'Computer Science': [
        { value: 'cs.AI', text: 'Artificial Intelligence (cs.AI)' },
        { value: 'cs.CC', text: 'Computational Complexity (cs.CC)' },
        { value: 'cs.CE', text: 'Computational Engineering, Finance, and Science (cs.CE)' },
        { value: 'cs.CG', text: 'Computational Geometry (cs.CG)' },
        { value: 'cs.GT', text: 'Computer Science and Game Theory (cs.GT)' },
        { value: 'cs.CV', text: 'Computer Vision and Pattern Recognition (cs.CV)' },
        { value: 'cs.CY', text: 'Computers and Society (cs.CY)' },
        { value: 'cs.CR', text: 'Cryptography and Security (cs.CR)' },
        { value: 'cs.DS', text: 'Data Structures and Algorithms (cs.DS)' },
        { value: 'cs.DB', text: 'Databases (cs.DB)' },
        { value: 'cs.DL', text: 'Digital Libraries (cs.DL)' },
        { value: 'cs.DM', text: 'Discrete Mathematics (cs.DM)' },
        { value: 'cs.DC', text: 'Distributed, Parallel, and Cluster Computing (cs.DC)' },
        { value: 'cs.ET', text: 'Emerging Technologies (cs.ET)' },
        { value: 'cs.FL', text: 'Formal Languages and Automata Theory (cs.FL)' },
        { value: 'cs.GL', text: 'General Literature (cs.GL)' },
        { value: 'cs.GR', text: 'Graphics (cs.GR)' },
        { value: 'cs.AR', text: 'Hardware Architecture (cs.AR)' },
        { value: 'cs.HC', text: 'Human-Computer Interaction (cs.HC)' },
        { value: 'cs.IR', text: 'Information Retrieval (cs.IR)' },
        { value: 'cs.IT', text: 'Information Theory (cs.IT)' },
        { value: 'cs.LO', text: 'Logic in Computer Science (cs.LO)' },
        { value: 'cs.LG', text: 'Machine Learning (cs.LG)' },
        { value: 'cs.MS', text: 'Mathematical Software (cs.MS)' },
        { value: 'cs.MA', text: 'Multiagent Systems (cs.MA)' },
        { value: 'cs.MM', text: 'Multimedia (cs.MM)' },
        { value: 'cs.NI', text: 'Networking and Internet Architecture (cs.NI)' },
        { value: 'cs.NE', text: 'Neural and Evolutionary Computing (cs.NE)' },
        { value: 'cs.NA', text: 'Numerical Analysis (cs.NA)' },
        { value: 'cs.OS', text: 'Operating Systems (cs.OS)' },
        { value: 'cs.OH', text: 'Other Computer Science (cs.OH)' },
        { value: 'cs.PF', text: 'Performance (cs.PF)' },
        { value: 'cs.PL', text: 'Programming Languages (cs.PL)' },
        { value: 'cs.RO', text: 'Robotics (cs.RO)' },
        { value: 'cs.SI', text: 'Social and Information Networks (cs.SI)' },
        { value: 'cs.SE', text: 'Software Engineering (cs.SE)' },
        { value: 'cs.SD', text: 'Sound (cs.SD)' },
        { value: 'cs.SC', text: 'Symbolic Computation (cs.SC)' },
        { value: 'eess.SY', text: 'Systems and Control (eess.SY)' }
    ],
    'Physics': [
        { value: 'physics', text: 'Physics (physics)' },
        { value: 'astro-ph', text: 'Astrophysics (astro-ph)' },
        { value: 'cond-mat', text: 'Condensed Matter (cond-mat)' },
        { value: 'gr-qc', text: 'General Relativity and Quantum Cosmology (gr-qc)' },
        { value: 'hep-ex', text: 'High Energy Physics - Experiment (hep-ex)' },
        { value: 'hep-lat', text: 'High Energy Physics - Lattice (hep-lat)' },
        { value: 'hep-ph', text: 'High Energy Physics - Phenomenology (hep-ph)' },
        { value: 'hep-th', text: 'High Energy Physics - Theory (hep-th)' },
        { value: 'math-ph', text: 'Mathematical Physics (math-ph)' },
        { value: 'nucl-ex', text: 'Nuclear Experiment (nucl-ex)' },
        { value: 'nucl-th', text: 'Nuclear Theory (nucl-th)' },
        { value: 'quant-ph', text: 'Quantum Physics (quant-ph)' }
    ],
    'Mathematics': [
        { value: 'math', text: 'Mathematics (math)' },
        { value: 'math.AG', text: 'Algebraic Geometry (math.AG)' },
        { value: 'math.AT', text: 'Algebraic Topology (math.AT)' },
        { value: 'math.AP', text: 'Analysis of PDEs (math.AP)' },
        { value: 'math.CT', text: 'Category Theory (math.CT)' },
        { value: 'math.CA', text: 'Classical Analysis and ODEs (math.CA)' },
        { value: 'math.CO', text: 'Combinatorics (math.CO)' },
        { value: 'math.AC', text: 'Commutative Algebra (math.AC)' },
        { value: 'math.CV', text: 'Complex Variables (math.CV)' },
        { value: 'math.DG', text: 'Differential Geometry (math.DG)' },
        { value: 'math.DS', text: 'Dynamical Systems (math.DS)' },
        { value: 'math.FA', text: 'Functional Analysis (math.FA)' },
        { value: 'math.GM', text: 'General Mathematics (math.GM)' },
        { value: 'math.GN', text: 'General Topology (math.GN)' },
        { value: 'math.GT', text: 'Geometric Topology (math.GT)' },
        { value: 'math.GR', text: 'Group Theory (math.GR)' },
        { value: 'math.HO', text: 'History and Overview (math.HO)' },
        { value: 'math.IT', text: 'Information Theory (math.IT)' },
        { value: 'math.KT', text: 'K-Theory and Homology (math.KT)' },
        { value: 'math.LO', text: 'Logic (math.LO)' },
        { value: 'math.MP', text: 'Mathematical Physics (math.MP)' },
        { value: 'math.MG', text: 'Metric Geometry (math.MG)' },
        { value: 'math.NT', text: 'Number Theory (math.NT)' },
        { value: 'math.NA', text: 'Numerical Analysis (math.NA)' },
        { value: 'math.OA', text: 'Operator Algebras (math.OA)' },
        { value: 'math.OC', text: 'Optimization and Control (math.OC)' },
        { value: 'math.PR', text: 'Probability (math.PR)' },
        { value: 'math.QA', text: 'Quantum Algebra (math.QA)' },
        { value: 'math.RT', text: 'Representation Theory (math.RT)' },
        { value: 'math.RA', text: 'Rings and Algebras (math.RA)' },
        { value: 'math.SP', text: 'Spectral Theory (math.SP)' },
        { value: 'math.ST', text: 'Statistics Theory (math.ST)' },
        { value: 'math.SG', text: 'Symplectic Geometry (math.SG)' }
    ],
    'Quantitative Biology': [
        { value: 'q-bio.BM', text: 'Biomolecules (q-bio.BM)' },
        { value: 'q-bio.CB', text: 'Cell Behavior (q-bio.CB)' },
        { value: 'q-bio.GN', text: 'Genomics (q-bio.GN)' },
        { value: 'q-bio.MN', text: 'Molecular Networks (q-bio.MN)' },
        { value: 'q-bio.NC', text: 'Neurons and Cognition (q-bio.NC)' },
        { value: 'q-bio.OT', text: 'Other Quantitative Biology (q-bio.OT)' },
        { value: 'q-bio.PE', text: 'Populations and Evolution (q-bio.PE)' },
        { value: 'q-bio.QM', text: 'Quantitative Methods (q-bio.QM)' },
        { value: 'q-bio.SC', text: 'Subcellular Processes (q-bio.SC)' },
        { value: 'q-bio.TO', text: 'Tissues and Organs (q-bio.TO)' }
    ],
    'Quantitative Finance': [
        { value: 'q-fin.CP', text: 'Computational Finance (q-fin.CP)' },
        { value: 'q-fin.EC', text: 'Economics (q-fin.EC)' },
        { value: 'q-fin.GN', text: 'General Finance (q-fin.GN)' },
        { value: 'q-fin.MF', text: 'Mathematical Finance (q-fin.MF)' },
        { value: 'q-fin.PM', text: 'Portfolio Management (q-fin.PM)' },
        { value: 'q-fin.PR', text: 'Pricing of Securities (q-fin.PR)' },
        { value: 'q-fin.RM', text: 'Risk Management (q-fin.RM)' },
        { value: 'q-fin.ST', text: 'Statistical Finance (q-fin.ST)' },
        { value: 'q-fin.TR', text: 'Trading and Market Microstructure (q-fin.TR)' }
    ],
    'Statistics': [
        { value: 'stat.AP', text: 'Applications (stat.AP)' },
        { value: 'stat.CO', text: 'Computation (stat.CO)' },
        { value: 'stat.ML', text: 'Machine Learning (stat.ML)' },
        { value: 'stat.ME', text: 'Methodology (stat.ME)' },
        { value: 'stat.OT', text: 'Other Statistics (stat.OT)' },
        { value: 'stat.TH', text: 'Theory (stat.TH)' }
    ],
    'Electrical Engineering and Systems Science': [
        { value: 'eess.AS', text: 'Audio and Speech Processing (eess.AS)' },
        { value: 'eess.IV', text: 'Image and Video Processing (eess.IV)' },
        { value: 'eess.SP', text: 'Signal Processing (eess.SP)' },
        { value: 'eess.SY', text: 'Systems and Control (eess.SY)' }
    ],
    'Economics': [
        { value: 'econ.EM', text: 'Econometrics (econ.EM)' },
        { value: 'econ.GN', text: 'General Economics (econ.GN)' },
        { value: 'econ.TH', text: 'Theoretical Economics (econ.TH)' }
    ]
};

function populateResearchFields() {
    const researchFieldSelect = document.getElementById('researchField');
    for (const category in researchFieldOptions) {
        const group = document.createElement('optgroup');
        group.label = category;

        researchFieldOptions[category].forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            group.appendChild(optionElement);
        });

        researchFieldSelect.appendChild(group);
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', populateResearchFields);

function savePaperInAccount(paper) {
    // Retrieve the paper details from somewhere, e.g., a data attribute or a global variable
    const paperDetails = {
        // You need to fill this object with actual data from your search results
        title: paper.title,
        abstract: paper.abstract,
        summary: paper.summary,
        references: paper.references,
        download_link: `http://arxiv.org/pdf/${paper.id}.pdf`, // Make sure `paper.id` is correct
        citations: paper.citations
    };

    fetch('/save_paper', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(paperDetails),
        credentials: 'same-origin' // For handling user sessions
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Or update the UI to show that the paper was saved
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
