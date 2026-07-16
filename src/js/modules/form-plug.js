export function initPlugForm() {
    const form = document.querySelector('.plug__form');


    if (form) {
        const emailInput = form.querySelector('.plug__form-input');
        const checkbox = form.querySelector('.plug__form-checkbox input[type="checkbox"]');
        const submitBtn = form.querySelector('.plug__form-btn');
        
        function toggleButton() {
            const isEmailFilled = emailInput.value.trim() !== '';
            const isChecked = checkbox.checked;

            submitBtn.disabled = !(isEmailFilled && isChecked);
        }

        emailInput.addEventListener('input', toggleButton);
        checkbox.addEventListener('change', toggleButton);
        toggleButton();

    }
}