// Minimal JSON Schema validator covering the keywords used by dist/check-report.schema.json,
// so the published schema is tested without adding a validator dependency.

type Schema = Record<string, any>

export function validate(
  schema: Schema,
  value: unknown,
  root: Schema = schema,
  at = '$'
): string[] {
  if (schema.$ref) {
    const target = (schema.$ref as string)
      .replace(/^#\//, '')
      .split('/')
      .reduce((node: Schema, key) => node[key], root)

    return validate(target, value, root, at)
  }

  if ('const' in schema && value !== schema.const) {
    return [`${at}: expected ${JSON.stringify(schema.const)}`]
  }

  if (schema.enum && !schema.enum.includes(value)) {
    return [`${at}: expected one of ${schema.enum.join(', ')}`]
  }

  switch (schema.type) {
    case 'string': {
      if (typeof value !== 'string') {
        return [`${at}: expected string`]
      }

      return schema.pattern && !new RegExp(schema.pattern).test(value)
        ? [`${at}: does not match ${schema.pattern}`]
        : []
    }

    case 'integer': {
      if (!Number.isInteger(value)) {
        return [`${at}: expected integer`]
      }

      return schema.minimum !== undefined && (value as number) < schema.minimum
        ? [`${at}: below ${schema.minimum}`]
        : []
    }

    case 'array':
      return Array.isArray(value)
        ? value.flatMap((item, index) =>
            validate(schema.items, item, root, `${at}[${index}]`)
          )
        : [`${at}: expected array`]

    case 'object': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return [`${at}: expected object`]
      }

      const record = value as Record<string, unknown>
      const errors: string[] = []

      for (const key of schema.required ?? []) {
        if (!(key in record)) {
          errors.push(`${at}.${key}: required`)
        }
      }

      for (const [key, item] of Object.entries(record)) {
        const property = schema.properties?.[key]

        if (property) {
          errors.push(...validate(property, item, root, `${at}.${key}`))
        } else if (schema.additionalProperties === false) {
          errors.push(`${at}.${key}: not allowed`)
        }
      }

      return errors
    }
  }

  return []
}
