import { Children, ClosureComponent, VnodeDOM } from 'mithril';
import { m } from './components.ts';
import codeEditorComponent from './code-editor-component.ts';
import { getDatalistId } from './datalist.ts';

const singular = {
    presets          : 'preset',
    provisions       : 'provision',
    virtualParameters: 'virtual parameter',
    files            : 'file',
    users            : 'user',
    permissions      : 'permission',
};

function createField(current, attr, focus): Children {
    if (attr.type === 'combo') {
        let selected      = '';
        let optionsValues = attr.options;
        if (current.object[attr.id] != null) {
            if (!optionsValues.includes(current.object[attr.id]))
                optionsValues = optionsValues.concat([current.object[attr.id]]);
            selected = current.object[attr.id];
        }

        const options = [m('option', {value: ''}, '')];
        for (const op of optionsValues)
            options.push(m('option', {value: op}, op));

        const select = m('select', {
                             name    : attr.id,
                             value   : selected,
                             class   : 'form-select',
                             oncreate: focus ? (_vnode) => {
                                 (_vnode.dom as HTMLSelectElement).focus();
                             } : null,
                             onchange: (e) => {
                                 current.object[attr.id] = e.target.value;
                                 current.modified        = true;
                                 e.redraw                = false;
                             },
                         },
                         options,
        );

        return m('div.col-sm-9', select);
    }

    if (attr.type === 'multi') {
        const optionsValues   = Array.from(
            new Set(attr.options.concat(current.object[attr.id] || [])),
        );
        const currentSelected = new Set(current.object[attr.id]);
        const options         = optionsValues.map((op) => {
            const id   = `${attr.id}-${op}`;
            const opts = {
                type    : 'checkbox',
                id      : id,
                value   : op,
                class   : 'form-check-input',
                oncreate: (_vnode) => {
                    if (focus && !options.length) _vnode.dom.focus();
                    if (currentSelected.has(op)) _vnode.dom.checked = true;
                },
                onchange: (e) => {
                    if (e.target.checked) currentSelected.add(op);
                    else currentSelected.delete(op);
                    current.object[attr.id] = Array.from(currentSelected);
                    current.modified        = true;
                    e.redraw                = false;
                },
            };

            return m(
                'div.form-check',
                [m('input', opts), m('label', {class: 'form-check-label', for: id}, op || attr.label)],
            );
        });

        return m('div.col-sm-9', options);
    }

    if (attr.type === 'code') {
        const attrs = {
            id      : attr.id,
            value   : current.object[attr.id],
            mode    : 'javascript',
            onSubmit: (dom) => {
                dom.form.querySelector('button[type=submit]').click();
            },
            onChange: (value) => {
                current.object[attr.id] = value;
                current.modified        = true;
            },
        };
        return m(codeEditorComponent, attrs);
    }

    if (attr.type === 'file') {
        const file = m('input', {
            type    : 'file',
            name    : attr.id,
            class   : 'form-control',
            oncreate: focus ? (_vnode) => {
                (_vnode.dom as HTMLInputElement).focus();
            } : null,
            onchange: (e) => {
                current.object[attr.id] = e.target.files;
                current.modified        = true;
                e.redraw                = false;
            },
        });

        return m('div.col-sm-9', file);
    }

    if (attr.type === 'textarea') {
        const textarea = m('textarea', {
            name      : attr.id,
            value     : current.object[attr.id],
            readonly  : attr.id === '_id' && !current.isNew,
            cols      : attr.cols || 80,
            rows      : attr.rows || 4,
            class     : 'form-control',
            style     : 'resize: none;',
            oncreate  : focus ? (_vnode) => {
                const dom = _vnode.dom as HTMLInputElement;
                dom.focus();
                dom.setSelectionRange(dom.value.length, dom.value.length);
            } : null,
            oninput   : (e) => {
                current.object[attr.id] = e.target.value;
                current.modified        = true;
                e.redraw                = false;
            },
            onkeypress: (e) => {
                e.redraw = false;
                if (e.which === 13 && !e.shiftKey) {
                    const dom = e.target;
                    dom.form.querySelector('button[type=submit]').click();
                    return false;
                }
                return true;
            },
        });

        return m('div.col-sm-9', textarea);
    }

    let datalist: string = null;
    if (attr.options) datalist = getDatalistId(attr.options);

    const input = m('input', {
        type        : attr.type === 'password' ? 'password' : 'text',
        name        : attr.id,
        list        : datalist,
        autocomplete: datalist ? 'off' : null,
        disabled    : attr.id === '_id' && !current.isNew,
        value       : current.object[attr.id],
        class       : 'form-control',
        oncreate    : focus
            ? (_vnode) => {
                (_vnode.dom as HTMLInputElement).focus();
            }
            : null,
        oninput     : (e) => {
            current.object[attr.id] = e.target.value;
            current.modified        = true;
            e.redraw                = false;
        },
    });

    return m('div.col-sm-9', input);
}

interface Attrs {
    base?: Record<string, any>;
    actionHandler: (action: string, object: any) => Promise<void>;
    resource: string;
    attributes: {
        id: string;
        label: string;
        type?: string;
        options?: string[];
    }[];
}

const component: ClosureComponent<Attrs> = () => {
    return {
        view: (vnode) => {
            const actionHandler = vnode.attrs.actionHandler;
            const attributes    = vnode.attrs.attributes;
            const resource      = vnode.attrs.resource;
            const base          = vnode.attrs.base || {};
            if (!vnode.state['current']) {
                vnode.state['current'] = {
                    isNew   : !base['_id'],
                    object  : Object.assign({}, base),
                    modified: false,
                };
            }

            const current = vnode.state['current'];

            const form  = [];
            let focused = false;
            for (const attr of attributes) {
                let focus = false;
                if (!focused && (current.isNew || attr.id !== '_id'))
                    focus = focused = true;

                form.push(
                    m('div', {class: (attr.type === 'code') ? 'row mb-12 code' : 'row mb-3'},
                      m(
                          'label',
                          {
                              class: (attr.type === 'code') ? 'form-label' : 'col-sm-3 col-form-label',
                              for  : attr.id,
                          },
                          attr.label || attr.id,
                      ),
                      createField(current, attr, focus),
                    ),
                );
            }

            const submit  = m('button.btn.btn-primary', {type: 'submit'}, 'Save') as VnodeDOM;
            const buttons = [submit];

            if (!current.isNew) {
                buttons.push(
                    m(
                        'button.btn.btn-danger',
                        {
                            type   : 'button',
                            title  : `Delete ${singular[resource] || resource}`,
                            onclick: (e) => {
                                e.redraw          = false;
                                e.target.disabled = true;
                                void actionHandler('delete', current.object).finally(() => {
                                    e.target.disabled = false;
                                });
                            },
                        },
                        'Delete',
                    ) as VnodeDOM,
                );
            }

            form.push(m('.modal-footer.actions-bar', buttons));

            const children = [
                m(
                    '.modal-header',
                    m('h5.modal-title', `${current.isNew ? 'New' : 'Editing'} ${singular[resource] || resource}`),
                ),
                m(
                    '.modal-body',
                    m(
                        'form.row',
                        {
                            onsubmit: (e) => {
                                e.redraw = false;
                                // const onsubmit = e.target.onsubmit;
                                e.preventDefault();
                                // e.target.onsubmit = null;
                                (submit.dom as HTMLFormElement).disabled = true;
                                // submit.dom.textContent = "Loading ...";
                                void actionHandler('save', current.object).finally(() => {
                                    // submit.dom.textContent = "Save";
                                    // e.target.onsubmit = onsubmit;
                                    (submit.dom as HTMLFormElement).disabled = false;
                                });
                            },
                        },
                        form,
                    ),
                ),

            ];
            return m('div.modal-content', children);
        },
    };
};

export default component;
