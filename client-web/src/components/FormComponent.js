import React, { useState } from 'react';

export default function formcomponent({ onSubmit } = {}) {
    const [values, setValues] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const validate = (v) => {
        const e = {};
        if (!v.name.trim()) e.name = 'Name is required';
        if (!v.email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(v.email)) e.email = 'Email is invalid';
        if (!v.message.trim()) e.message = 'Message is required';
        return e;
    };

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setValues((s) => ({ ...s, [name]: value }));
        setErrors((s) => ({ ...s, [name]: undefined }));
    };

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        const e = validate(values);
        setErrors(e);
        if (Object.keys(e).length) return;

        setSubmitting(true);
        try {
            if (typeof onSubmit === 'function') {
                await onSubmit(values);
            } else {
                // default behavior: log to console
                console.log('form submit', values);
            }
            setValues({ name: '', email: '', message: '' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div>
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && <div id="name-error" role="alert">{errors.name}</div>}
            </div>

            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && <div id="email-error" role="alert">{errors.email}</div>}
            </div>

            <div>
                <label htmlFor="message">Message</label>
                <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={values.message}
                    onChange={handleChange}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && <div id="message-error" role="alert">{errors.message}</div>}
            </div>

            <div>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send'}
                </button>
            </div>
        </form>
    );
}