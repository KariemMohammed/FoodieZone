const rowData = document.getElementById("rowData");
const loadingScreen = document.getElementById("loading-screen");

function showLoading() {
    loadingScreen.style.display = 'flex';
}
function hideLoading() {
    loadingScreen.style.display = 'none';
}
// loading 
async function fetchWithLoading(url) {
    showLoading();
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching meal details:", error);
        rowData.innerHTML = '<div class="col-12 text-center py-4 text-danger">Error loading Data</div>';
    } finally {
        hideLoading();
    }
}
// Slider nav right
$(document).ready(function(){
    $(".open-close-icon").click(function(){
        const sideNav = $(".side-nav-menu");
        const navHeader = $(".nav-header");
        const navItems =$(".side-nav-menu ul li")
        
        if (sideNav.css("left") === "-250px") {
            sideNav.css("left", "0");
            navHeader.css("left", "250px");
            $(this).removeClass("fa-sliders").addClass("fa-x");
            navItems.each(function(i){
                const that = $(this);
                setTimeout(() => {
                    that.addClass('show');
                }, i * 100)
            })
        } 
        else {
            navItems.removeClass('show');
            sideNav.css("left", "-250px");
            navHeader.css("left", "0");
            $(this).removeClass("fa-x").addClass("fa-sliders");
        }
    });
// slider replace  
  $("#searchContainer").click(function(e) {
    e.preventDefault();
    $("#search-Container").removeClass("d-none").find("input").first().focus();
    $("#rowData").addClass("d-none").empty();
    $("#contactForm").remove(); 
    closeSideMenu();
});
// search inputs
function setupSearch(inputElement, isLetterSearch = false) {
    $(inputElement).on('input', debounce(async function() {
        const searchValue = $(this).val().trim();
        
        if ((isLetterSearch && searchValue.length === 1) || (!isLetterSearch && searchValue.length > 0)) {
            try {
                const endpoint = isLetterSearch 
                    ? `https://www.themealdb.com/api/json/v1/1/search.php?f=${searchValue}`
                    : `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchValue}`;
                
                const data = await fetchWithLoading(endpoint);
                
                if (data?.meals) {
                    displayMeals(data.meals);
                } else {
                    const message = isLetterSearch  ? `No meals found starting with ${searchValue}` : "No meals found";
                    rowData.innerHTML = `<div class="col-12 text-center py-4 text-danger">${message}</div>`;
                }
                $("#rowData").removeClass("d-none");
            } catch (error) {
                rowData.innerHTML = '<div class="col-12 text-center py-4 text-danger">Error loading data</div>';
                $("#rowData").removeClass("d-none");
            }
        } else if (searchValue.length === 0) {
            getItem();
        }
    }, 500));
}
// Inputs Search 
$(document).ready(function() {
    setupSearch("#searchName");
    setupSearch("#searchFirstLetter", true); 
});
// ul li nav 
    $(".side-nav-menu ul li a").not("#searchContainer").click(function(e) {
        e.preventDefault();
        $("#search-Container").addClass("d-none");
        $("#rowData").removeClass("d-none");
        closeSideMenu();
    });
// Cat 
    $("#Categories").click(function() {
        setCategories();
    });
// Areas 
   $("#Area").click(function() {
        setArea();
    });
    // Ingredients
    $("#Ingredients").click(function() {
        setIngredients();
    });

    function closeSideMenu() {
        $(".side-nav-menu").animate({ left: '-250px' }, 300);
        $(".nav-header").animate({ left: '0' }, 300);
        $(".open-close-icon").removeClass('fa-x').addClass('fa-sliders');
    }
});
// default display
function displayMeals(meals) {
    let html = '';
    meals.forEach(meal => {
        html += `
        <div class="col-md-3">
            <div onclick="showMealDetails('${meal.idMeal}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                <img src="${meal.strMealThumb}" class="w-100" alt="${meal.strMeal}">
                <div class="meal-layer position-absolute d-flex align-items-center text-black p-2">
                    <h3 class="w-100">${meal.strMeal}</h3>
                </div>
            </div>
        </div>`;
    });
    rowData.innerHTML = html;
}
async function showMealDetails(mealId) {
    showLoading();
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();
        if(data.meals) {
            displayMealDetails(data.meals[0]);
        }
    } catch (error) {
        console.error("Error fetching meal details:", error);
        rowData.innerHTML = '<div class="col-12 text-center py-4 text-danger">Error loading meal details</div>';
    } finally {
        hideLoading();
    }
}
function displayMealDetails(meal) {
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        if(meal[`strIngredient${i}`]) {
            ingredients += `<li class="alert alert-info m-2 p-1">${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}</li>`;
        }
    }
    const tags = meal.strTags ? meal.strTags.split(',') : [];
    let tagsHtml = tags.map(tag => `<li class="alert alert-danger m-2 p-1">${tag}</li>`).join('');
    rowData.innerHTML = `
    <div class="row">
        <div class="col-md-4">
            <img src="${meal.strMealThumb}" class="w-100 rounded-3" alt="${meal.strMeal}">
            <h2 class="mt-3 text-white">${meal.strMeal}</h2>
        </div>
        <div class="col-md-8 text-white">
            <h2>Instructions</h2>
            <p>${meal.strInstructions}</p>
            
            <h3><span class="fw-bold text-white">Area:</span> ${meal.strArea}</h3>
            <h3><span class="fw-bold text-white">Category:</span> ${meal.strCategory}</h3>
            
            <h3>Ingredients:</h3>
            <ul class="list-unstyled d-flex flex-wrap">
                ${ingredients}
            </ul>
            
            ${tags.length ? `
            <h3>Tags:</h3>
            <ul class="list-unstyled d-flex flex-wrap">
                ${tagsHtml}
            </ul>` : ''}
            
            <div class="mt-4">
                ${meal.strSource ? `<a href="${meal.strSource}" target="_blank" class="btn btn-success me-2">Source</a>` : ''}
                ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-danger">YouTube</a>` : ''}
            </div>
        </div>
    </div>`;
}
// Cat
async function setCategories() {
    const data = await fetchWithLoading('https://www.themealdb.com/api/json/v1/1/categories.php');
    if(data && data.categories) {
        let html = '';
        data.categories.forEach(category => {
            html += `
            <div class="col-md-3">
                <div onclick="getMealsByCategory('${category.strCategory}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                    <img src="${category.strCategoryThumb}" class="w-100" alt="${category.strCategory}">
                    <div class="meal-layer position-absolute d-flex justify-content-center flex-column text-center">
                        <h3>${category.strCategory}</h3>
                        <p>${(category.strCategoryDescription || '').split(' ').slice(0, 20).join(' ')}</p>
                    </div>
                </div>
            </div>`;
        });
        rowData.innerHTML = html;
        $("#rowData").removeClass("d-none");
    }
}
async function getMealsByCategory(category) {
    const data = await fetchWithLoading(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    if(data && data.meals) {
        displayMeals(data.meals);
    }
}
// Area
async function setArea() {
    const data = await fetchWithLoading('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
    if(data && data.meals) {
        let html = '';
        data.meals.forEach(area => {
            html += `
            <div class="col-md-3">
                <div onclick="getMealsByArea('${area.strArea}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                    <div class="area-icon text-center text-white h-100 d-flex flex-column justify-content-center">
                        <i class="fa-solid fa-house-laptop fa-4x"></i>
                        <h3>${area.strArea}</h3>
                    </div>
                </div>
            </div>`;
        });
        rowData.innerHTML = html;
        $("#rowData").removeClass("d-none");
    }
}
async function getMealsByArea(area) {
    const data = await fetchWithLoading(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
    if(data && data.meals) {
        displayMeals(data.meals);
    }
}
// Ingredients
async function setIngredients() {
    const data = await fetchWithLoading("https://www.themealdb.com/api/json/v1/1/list.php?i=list");
    if(data && data.meals) {
        let html = '';
        data.meals.forEach(ingredient => {
            html += `
            <div class="col-md-3">
                <div onclick="getMealsByIngredient('${ingredient.strIngredient}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                    <div class="area-icon text-center text-white h-100 d-flex flex-column justify-content-center">
                        <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                        <h3>${ingredient.strIngredient}</h3>
                        <p>${(ingredient.strDescription || 'No description available').split(' ').slice(0, 20).join(' ')}</p>
                    </div>
                </div>
            </div>`;
        });
        rowData.innerHTML = html;
    }
}
async function getMealsByIngredient(ingredient) {
    const data = await fetchWithLoading(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
    if(data && data.meals) {
        displayMeals(data.meals);
    }
}
// Debounce function
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
} 
async function getItem() {
    const data = await fetchWithLoading('https://www.themealdb.com/api/json/v1/1/search.php?s=');
    if(data && data.meals) {
        displayMeals(data.meals);
        $("#rowData").removeClass("d-none");
    }
}
// Initialize
getItem();
// Contuct Us 
$(document).ready(() => {
    $("#Contact-Us").click(showContacts);
});
function showContacts() {
    $('#rowData').remove();
    const formHTML = `
    <div id="contactForm" class="contact min-vh-100 d-flex justify-content-center align-items-center">
        <div class="container w-75 text-center">
            <div class="row g-4">
                ${['Name', 'Email', 'Phone', 'Age', 'Password', 'Repassword'].map(field => `
                    <div class="col-md-6">
                        <input class="form-control bg-transparent text-white" type="${field.toLowerCase().includes() ? 'password' : field.toLowerCase() === 'age' ? 'number' : field.toLowerCase() === 'email' ? 'email' : field.toLowerCase() === 'phone' ? 'tel' : 'text'}" placeholder="Enter Your ${field}" id="input${field}">
                        <div id="${field.toLowerCase()}Alert" class="alert alert-danger d-none mt-2">${getAlertMsg(field)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="d-flex justify-content-center">
                <button disabled class="btn btn-outline-danger px-2 mt-3" id="submitBtn">Submit</button>
            </div>
        </div>
    </div>`;
    
    $('body').append(formHTML);
    const inputFields = [
        { id: 'inputName', alert: 'nameAlert', valid: () => $('#inputName').val().trim().length >= 2 },
        { id: 'inputEmail', alert: 'emailAlert', valid: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#inputEmail').val()) },
        { id: 'inputPhone', alert: 'phoneAlert', valid: () => /^[0-9]{10,15}$/.test($('#inputPhone').val()) },
        { id: 'inputAge', alert: 'ageAlert', valid: () => { let age = +$('#inputAge').val(); return age >= 18 && age <= 120; } },
        { id: 'inputPassword', alert: 'passwordAlert', valid: () => $('#inputPassword').val().length >= 8 },
        { id: 'inputRepassword', alert: 'repasswordAlert', valid: () => $('#inputPassword').val() === $('#inputRepassword').val() && $('#inputPassword').val().length >= 8 }
    ];
    inputFields.forEach(({ id, alert, valid }) => {
        const input = document.getElementById(id);
        input.addEventListener('input', validateInputs);
        input.addEventListener('focus', () => {
            input.dataset.touched = 'true';
            validateInputs();
        });
    });
    function validateInputs() {
        let allValid = true;
        inputFields.forEach(({ id, alert, valid }) => {
            const input = document.getElementById(id);
            const alertBox = document.getElementById(alert);
            const touched = input.dataset.touched === 'true';
            const isValid = valid();
            if (touched) alertBox.classList.toggle('d-none', isValid);
            if (touched && !isValid) allValid = false;
        });
        const allTouched = inputFields.every(f => document.getElementById(f.id).dataset.touched === 'true');
        document.getElementById('submitBtn').disabled = !(allValid && allTouched);
    }
    document.getElementById('submitBtn').addEventListener('click', () => {
    if (document.getElementById('submitBtn').disabled) return;

    inputFields.forEach(({ id }) => {
        const input = document.getElementById(id);
        input.value = '';
        input.dataset.touched = '';
    });
    // Disable submit button again
    document.getElementById('submitBtn').disabled = true;
});
    function getAlertMsg(field) {
        switch (field) {
            case 'Name': return 'Name must be at least 2 characters';
            case 'Email': return 'Please enter a valid email';
            case 'Phone': return 'Enter Your Phone Number';
            case 'Age': return 'Please Enter Your Age';
            case 'Password': return 'Password must be 8+ characters';
            case 'Repassword': return 'Passwords must match';
            default: return '';
        }
    }
}