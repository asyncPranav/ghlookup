// error
const errorBox = document.querySelector(".errorBox");
const errorText = document.querySelector(".errorText");

// profile
const profileWrapper = document.querySelector(".profileWrapper");

// user search
const form = document.querySelector("form");
const search = document.querySelector("#search");

// repo
const reposTitleContainer = document.querySelector(".reposTitleContainer");
const reposContainer = document.querySelector(".reposContainer");

// api
const API = "https://api.github.com/users";

// handle search
form.addEventListener("submit", (e) => {
    e.preventDefault();

    hideError(); // clear previous error
    profileWrapper.innerHTML = "";
    reposContainer.innerHTML = "";
    reposTitleContainer.innerHTML = "";
    fetchData();

    search.value = "";
});


// fetch data
async function fetchData() {
    const username = search.value.trim();

    // if empty username
    if (username.length === 0) {
        showError("❌ Cant't search empty username !!");
        return;
    }

    // fetch data
    const response = await fetch(`${API}/${username}`);
    const data = await response.json();

    console.log("Search limit left : " + response.headers.get("X-RateLimit-Remaining")); 

    // if failed fetching
    if (response.status === 404) {
        showError(" User not found. Please check the username.");
        return;
    }

    if (response.status === 403) {
        const rateLimitRemaining = response.headers.get(
            "X-RateLimit-Remaining"
        );
        if (rateLimitRemaining === "0") {
            showError("GitHub API rate limit exceeded. Try again later.");
        } else {
            showError("Access forbidden. You may be blocked or unauthorized.");
        }
        return;
    }
    hideError();

    // else set profile header
    const avatarUrl = data.avatar_url;
    const name = data.name;
    const login = data.login;
    const bio = data.bio;
    const followers = data.followers;
    const following = data.following;

    const newProfileHead = document.createElement("div");
    newProfileHead.className = "profileContainer";
    newProfileHead.innerHTML = `
        <div class="profileHead">
            <div class="profileImg">
                <img src=${avatarUrl} alt="user-image">
            </div>
            <div class="profileName">
                <p class="profileNameText">${name || "Not available"}</p>
                <p class="profileUsernameText">@${login}</p>
            </div>
        </div>

        <!-- bio -->
        <div class="bioContainer">
            <p class="bioText">Bio : ${bio || "Not available"}</p>
        </div>

        <div class="followContainer">
            <span><i class="fa-solid fa-user-group"></i></span>
            <!-- <i class="fa-solid fa-user-group"></i> -->
            <span class="followersText"><span class="followTextNum">${followers}</span> Followers</span>
            <span class="followingText"><span class="followingTextNum">${following}</span> Following</span>
        </div>
    `;

    profileWrapper.append(newProfileHead);

    // repo title
    const repoTitle = document.createElement("h2");
    repoTitle.className = "reposTitle";
    repoTitle.textContent = "📁 Repositories";
    reposTitleContainer.prepend(repoTitle);

    // fetch repo
    const repoUrl = data.repos_url;
    const repoResponse = await fetch(repoUrl);
    const repoData = await repoResponse.json();

    // if failed to fetch repo
    if (!repoResponse.ok) {
        showError("Failed to fetch repos.");
        return;
    }

    if (repoData.length === 0) {
        const noRepo = document.createElement("p");
        noRepo.className = "noRepoError";
        noRepo.textContent = "User haven't any repository !!";
        reposContainer.append(noRepo);
        return;
    }

    // repo items
    repoData.forEach((obj) => {
        const repoName = obj.name;
        const repoUrl = obj.html_url;
        const repoDesc = obj.description;
        const repoLanguage = obj.language;
        const repoStars = obj.stargazers_count;
        const repoUpdatedAt = obj.updated_at;

        // create repo dynamically
        const newRepo = document.createElement("div");
        newRepo.className = "repoCard";
        newRepo.innerHTML = `
            <a href=${repoUrl} target="_blank" class="repoName">${repoName}</a>
            <p class="repoDesc">${repoDesc || "No description available"}</p>
            <div class="repoMeta">
                <span class="repoLang">🌐 ${repoLanguage}</span>
                <span class="repoStars">⭐ ${repoStars}</span>
                <span class="repoUpdated">🕒 Last update on ${
                    repoUpdatedAt.split("T")[0]
                }</span>
            </div>
        `;

        reposContainer.append(newRepo);
    });
}

// error handle
function showError(message) {
    errorText.textContent = message;
    errorBox.style.display = "block";
}

function hideError() {
    errorText.textContent = "";
    errorBox.style.display = "none";
}
