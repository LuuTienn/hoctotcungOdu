import { db } from "./firebase.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js"; 

const questionTemplate = `
    <div class="question-entry">
        <label>Loại câu hỏi:</label>
        <select class="question-type">
            <option value="multiple">Trắc nghiệm</option>
            <option value="truefalse">Đúng/Sai</option>
        </select>
        
        <label>Câu hỏi:</label>
        <input type="text" class="question-text" placeholder="Nhập câu hỏi" required>
        
        <div class="multiple-choice-options">
            <label>Lựa chọn:</label>
            <input type="text" class="option" placeholder="Lựa chọn 1" required>
            <input type="text" class="option" placeholder="Lựa chọn 2" required>
            <input type="text" class="option" placeholder="Lựa chọn 3" required>
            <input type="text" class="option" placeholder="Lựa chọn 4" required>
            <label>Đáp án đúng (1-4):</label>
            <input type="number" class="correct-answer" min="1" max="4" required>
        </div>

        <div class="true-false-options" style="display: none;">
            <label>Đáp án:</label>
            <select class="correct-answer-truefalse">
                <option value="true">Đúng</option>
                <option value="false">Sai</option>
            </select>
        </div>
    </div>
`;

async function listTests() {
    const snapshot = await getDocs(collection(db, "dethi"));
    if (snapshot.empty) {
        document.getElementById("test-items").innerHTML = '<p>Danh sách đề thi rỗng!</p>';
        return;
    }
    
    let data = [];
    snapshot.forEach(doc => {
        data.push({
            id: doc.id,
            ...doc.data()
        });
    });

    let html = '';
    data.forEach(item => {
        html += `<p>${item.title}</p>`;
    });
    
    document.getElementById("test-items").innerHTML = html;
}

listTests();

function addQuestion() {
    const container = document.getElementById('questions-container');
    container.insertAdjacentHTML('beforeend', questionTemplate);
    
    const lastQuestionEntry = container.lastElementChild;
    const questionTypeSelect = lastQuestionEntry.querySelector('.question-type');
    questionTypeSelect.addEventListener('change', (event) => toggleQuestionType(event.target));
}

function toggleQuestionType(selectElement) {
    const questionEntry = selectElement.closest('.question-entry');
    const multipleChoiceOptions = questionEntry.querySelector('.multiple-choice-options');
    const trueFalseOptions = questionEntry.querySelector('.true-false-options');

    if (selectElement.value === 'multiple') {
        multipleChoiceOptions.style.display = 'block';
        trueFalseOptions.style.display = 'none';
    } else if (selectElement.value === 'truefalse') {
        multipleChoiceOptions.style.display = 'none';
        trueFalseOptions.style.display = 'block';
    }
}

async function submitQuestions() {
    const questionsContainer = document.getElementById("questions-container");
    const questionEntries = questionsContainer.querySelectorAll(".question-entry");
    const questions = [];

    questionEntries.forEach((entry) => {
        const questionText = entry.querySelector(".question-text").value;
        const questionType = entry.querySelector(".question-type").value;

        if (questionType === "multiple") {
            const options = Array.from(entry.querySelectorAll(".option")).map(option => option.value);
            const correctAnswerIndex = parseInt(entry.querySelector(".correct-answer").value) - 1;

            if (questionText && options.length === 4 && !isNaN(correctAnswerIndex)) {
                questions.push({
                    type: "multiple",
                    question: questionText,
                    answers: options,
                    correctAnswer: options[correctAnswerIndex]
                });
            } else {
                alert("Vui lòng đảm bảo rằng mỗi câu hỏi có đủ lựa chọn và đáp án đúng.");
                return;
            }
        } else if (questionType === "truefalse") {
            const correctAnswer = entry.querySelector(".correct-answer-truefalse").value;

            if (questionText && correctAnswer) {
                questions.push({
                    type: "truefalse",
                    question: questionText,
                    correctAnswer: correctAnswer === "true"
                });
            } else {
                alert("Vui lòng nhập câu hỏi và đáp án đúng cho câu hỏi Đúng/Sai.");
                return;
            }
        }
    });

    try {
        const testTitle = localStorage.getItem("testTitle");
        const testDocRef = await addDoc(collection(db, "dethi"), { title: testTitle, questions: questions });
        localStorage.setItem("dethi", JSON.stringify(questions));
        
        document.getElementById("question-form").reset();
        document.getElementById("questions-container").innerHTML = ''; // Xóa các câu hỏi cũ
        document.getElementById("question-section").style.display = "none";
        document.getElementById("test-section").style.display = "block";

        window.location.href = "danhsachgiaovien.html";
        alert('Câu hỏi đã được lưu thành công!');
    } catch (error) {
        console.error("Lỗi khi lưu câu hỏi ", error);
    }
}

function loadQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = ''; // Xóa nội dung cũ

    try {
        const storedData = localStorage.getItem("dethi");
        const questions = storedData ? JSON.parse(storedData) : [];

        if (questions.length > 0) {
            questions.forEach((questionData) => {
                const questionElement = document.createElement('div');
                questionElement.className = 'question-item';
                questionElement.innerHTML = `<p>${questionData.question}</p>`;

                if (questionData.type === "multiple") {
                    questionData.answers.forEach((option) => {
                        const answerButton = document.createElement('button');
                        answerButton.className = 'answer-button';
                        answerButton.textContent = option;
                        answerButton.onclick = () => selectAnswer(option);
                        questionElement.appendChild(answerButton);
                    });
                } else if (questionData.type === "truefalse") {
                    ["Đúng", "Sai"].forEach((option) => {
                        const answerButton = document.createElement('button');
                        answerButton.className = 'answer-button';
                        answerButton.textContent = option;
                        answerButton.onclick = () => selectAnswer(option === "Đúng");
                        questionElement.appendChild(answerButton);
                    });
                }

                quizContainer.appendChild(questionElement);
            });
        } else {
            quizContainer.innerHTML = '<p>Không có câu hỏi nào để hiển thị.</p>';
        }
    } catch (error) {
        console.error("Lỗi khi tải câu hỏi: ", error);
        quizContainer.innerHTML = '<p>Đã xảy ra lỗi khi tải câu hỏi.</p>';
    }
}

function selectAnswer(selectedOption) {
    alert(`Bạn đã chọn: ${selectedOption}`);
}

window.addQuestion = addQuestion;
window.submitQuestions = submitQuestions;
window.loadQuiz = loadQuiz;