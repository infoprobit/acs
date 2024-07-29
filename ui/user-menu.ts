import m, { ClosureComponent, Component } from 'mithril';
import * as store from './store.ts';
import * as notifications from './notifications.ts';

const component: ClosureComponent = (): Component => {
    return {
        view: () => {
            if (!window.username) {
                return m(
                    'nav.header-nav.ms-auto.pe-3',
                    m(
                        'a',
                        {
                            class: 'btn.btn-outline-danger.btn-sm',
                            href : '#!/login?' + m.buildQueryString({continue: m.route.get()}),
                        },
                        'Login',
                    ),
                );
            }

            return m(
                'nav.header-nav.ms-auto.pe-3',
                m('span.pe-2', window.username),
                m(
                    'button.btn.btn-danger.btn-sm',
                    {
                        onclick: (e) => {
                            e.target.disabled = true;
                            store
                                .logOut()
                                .then(() => {
                                    location.hash = '';
                                    location.reload();
                                })
                                .catch((err) => {
                                    e.target.disabled = false;
                                    notifications.push('error', err.message);
                                });
                            return false;
                        },
                    },
                    'Logout',
                ),
            );
        },
    };
};

export default component;
