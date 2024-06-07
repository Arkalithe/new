document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');

    fetch('config.xml')
        .then(response => response.text())
        .then(xmlText => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");

            const parseError = xmlDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                console.error('Erreur de parsing XML:', parseError[0].textContent);
                return;
            }

            const title = xmlDoc.getElementsByTagName('title')[0].textContent;
            const helpText = xmlDoc.getElementsByTagName('helpText')[0].textContent;
            const fields = xmlDoc.getElementsByTagName('field');
            const submitButton = xmlDoc.getElementsByTagName('submitButton')[0].textContent;

            document.querySelector('h3').textContent = title;
            document.getElementById('Help').textContent = helpText;

            const formElement = document.getElementById('contactForm');
            formElement.innerHTML = '';

            Array.from(fields).forEach(field => {
                const label = field.getElementsByTagName('label')[0].textContent;
                const id = field.getElementsByTagName('id')[0].textContent;
                const type = field.getElementsByTagName('type')[0].textContent;

                let inputElement;
                if (type === 'textarea') {
                    inputElement = `<textarea id="${id}" class="form-control" name="${id}" required></textarea>`;
                } else {
                    inputElement = `<input type="${type}" class="form-control" id="${id}" name="${id}" required>`;
                }

                const fieldHTML = `
                    <div>
                        <label for="${id}" class="form-label">${label}</label>
                        ${inputElement}
                    </div>
                `;
                formElement.innerHTML += fieldHTML;
            });

            formElement.innerHTML += `<button type="submit" class="btn btn-primary">${submitButton}</button>`;
        });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const formData = new FormData(form);
        let data = '<formData>';
    
        formData.forEach((value, key) => {
            data += `<${key}>${value}</${key}>`;
        });
    
        data += '</formData>';
    
        const validationErrors = validateFormData(Object.fromEntries(formData));
        if (validationErrors.length > 0) {
            alert('Veuillez corriger les erreurs suivantes:\n' + validationErrors.join('\n'));
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/BackEnd/Api/FormRouter.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml',
                },
                body: data,
            });
    
            if (response.ok) {
                alert('Votre message a été envoyé avec succès.');
                form.reset();
            } else {
                const errorText = await response.text();
                alert('Une erreur est survenue lors de l\'envoi du message: ' + errorText);
            }
        } catch (error) {
            alert('Une erreur est survenue: ' + error.message);
        }
    });
});

function validateFormData(data) {
    const errors = [];

    if (!data.nom || data.nom.trim().length === 0) {
        errors.push('Le champ "Votre Nom" est requis.');
    }

    if (!data.prenom || data.prenom.trim().length === 0) {
        errors.push('Le champ "Votre Prénom" est requis.');
    }

    if (!data.email || !validateEmail(data.email)) {
        errors.push('Veuillez entrer une adresse email valide.');
    }

    if (!data.description || data.description.trim().length === 0) {
        errors.push('Le champ "Motif du contact" est requis.');
    }

    return errors;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}
