
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Exercice
 * 
 */
export type Exercice = $Result.DefaultSelection<Prisma.$ExercicePayload>
/**
 * Model Tag
 * 
 */
export type Tag = $Result.DefaultSelection<Prisma.$TagPayload>
/**
 * Model Entrainement
 * 
 */
export type Entrainement = $Result.DefaultSelection<Prisma.$EntrainementPayload>
/**
 * Model EntrainementExercice
 * 
 */
export type EntrainementExercice = $Result.DefaultSelection<Prisma.$EntrainementExercicePayload>
/**
 * Model Echauffement
 * 
 */
export type Echauffement = $Result.DefaultSelection<Prisma.$EchauffementPayload>
/**
 * Model BlocEchauffement
 * 
 */
export type BlocEchauffement = $Result.DefaultSelection<Prisma.$BlocEchauffementPayload>
/**
 * Model SituationMatch
 * 
 */
export type SituationMatch = $Result.DefaultSelection<Prisma.$SituationMatchPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Exercices
 * const exercices = await prisma.exercice.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Exercices
   * const exercices = await prisma.exercice.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.exercice`: Exposes CRUD operations for the **Exercice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Exercices
    * const exercices = await prisma.exercice.findMany()
    * ```
    */
  get exercice(): Prisma.ExerciceDelegate<ExtArgs>;

  /**
   * `prisma.tag`: Exposes CRUD operations for the **Tag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tags
    * const tags = await prisma.tag.findMany()
    * ```
    */
  get tag(): Prisma.TagDelegate<ExtArgs>;

  /**
   * `prisma.entrainement`: Exposes CRUD operations for the **Entrainement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Entrainements
    * const entrainements = await prisma.entrainement.findMany()
    * ```
    */
  get entrainement(): Prisma.EntrainementDelegate<ExtArgs>;

  /**
   * `prisma.entrainementExercice`: Exposes CRUD operations for the **EntrainementExercice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EntrainementExercices
    * const entrainementExercices = await prisma.entrainementExercice.findMany()
    * ```
    */
  get entrainementExercice(): Prisma.EntrainementExerciceDelegate<ExtArgs>;

  /**
   * `prisma.echauffement`: Exposes CRUD operations for the **Echauffement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Echauffements
    * const echauffements = await prisma.echauffement.findMany()
    * ```
    */
  get echauffement(): Prisma.EchauffementDelegate<ExtArgs>;

  /**
   * `prisma.blocEchauffement`: Exposes CRUD operations for the **BlocEchauffement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BlocEchauffements
    * const blocEchauffements = await prisma.blocEchauffement.findMany()
    * ```
    */
  get blocEchauffement(): Prisma.BlocEchauffementDelegate<ExtArgs>;

  /**
   * `prisma.situationMatch`: Exposes CRUD operations for the **SituationMatch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SituationMatches
    * const situationMatches = await prisma.situationMatch.findMany()
    * ```
    */
  get situationMatch(): Prisma.SituationMatchDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Exercice: 'Exercice',
    Tag: 'Tag',
    Entrainement: 'Entrainement',
    EntrainementExercice: 'EntrainementExercice',
    Echauffement: 'Echauffement',
    BlocEchauffement: 'BlocEchauffement',
    SituationMatch: 'SituationMatch',
    User: 'User'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "exercice" | "tag" | "entrainement" | "entrainementExercice" | "echauffement" | "blocEchauffement" | "situationMatch" | "user"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Exercice: {
        payload: Prisma.$ExercicePayload<ExtArgs>
        fields: Prisma.ExerciceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExerciceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExerciceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload>
          }
          findFirst: {
            args: Prisma.ExerciceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExerciceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload>
          }
          findMany: {
            args: Prisma.ExerciceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload>[]
          }
          create: {
            args: Prisma.ExerciceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload>
          }
          createMany: {
            args: Prisma.ExerciceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExerciceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload>[]
          }
          delete: {
            args: Prisma.ExerciceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload>
          }
          update: {
            args: Prisma.ExerciceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload>
          }
          deleteMany: {
            args: Prisma.ExerciceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExerciceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExerciceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercicePayload>
          }
          aggregate: {
            args: Prisma.ExerciceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExercice>
          }
          groupBy: {
            args: Prisma.ExerciceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExerciceGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExerciceCountArgs<ExtArgs>
            result: $Utils.Optional<ExerciceCountAggregateOutputType> | number
          }
        }
      }
      Tag: {
        payload: Prisma.$TagPayload<ExtArgs>
        fields: Prisma.TagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findFirst: {
            args: Prisma.TagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findMany: {
            args: Prisma.TagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          create: {
            args: Prisma.TagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          createMany: {
            args: Prisma.TagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          delete: {
            args: Prisma.TagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          update: {
            args: Prisma.TagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          deleteMany: {
            args: Prisma.TagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          aggregate: {
            args: Prisma.TagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTag>
          }
          groupBy: {
            args: Prisma.TagGroupByArgs<ExtArgs>
            result: $Utils.Optional<TagGroupByOutputType>[]
          }
          count: {
            args: Prisma.TagCountArgs<ExtArgs>
            result: $Utils.Optional<TagCountAggregateOutputType> | number
          }
        }
      }
      Entrainement: {
        payload: Prisma.$EntrainementPayload<ExtArgs>
        fields: Prisma.EntrainementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EntrainementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EntrainementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload>
          }
          findFirst: {
            args: Prisma.EntrainementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EntrainementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload>
          }
          findMany: {
            args: Prisma.EntrainementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload>[]
          }
          create: {
            args: Prisma.EntrainementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload>
          }
          createMany: {
            args: Prisma.EntrainementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EntrainementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload>[]
          }
          delete: {
            args: Prisma.EntrainementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload>
          }
          update: {
            args: Prisma.EntrainementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload>
          }
          deleteMany: {
            args: Prisma.EntrainementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EntrainementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EntrainementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementPayload>
          }
          aggregate: {
            args: Prisma.EntrainementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEntrainement>
          }
          groupBy: {
            args: Prisma.EntrainementGroupByArgs<ExtArgs>
            result: $Utils.Optional<EntrainementGroupByOutputType>[]
          }
          count: {
            args: Prisma.EntrainementCountArgs<ExtArgs>
            result: $Utils.Optional<EntrainementCountAggregateOutputType> | number
          }
        }
      }
      EntrainementExercice: {
        payload: Prisma.$EntrainementExercicePayload<ExtArgs>
        fields: Prisma.EntrainementExerciceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EntrainementExerciceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EntrainementExerciceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload>
          }
          findFirst: {
            args: Prisma.EntrainementExerciceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EntrainementExerciceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload>
          }
          findMany: {
            args: Prisma.EntrainementExerciceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload>[]
          }
          create: {
            args: Prisma.EntrainementExerciceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload>
          }
          createMany: {
            args: Prisma.EntrainementExerciceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EntrainementExerciceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload>[]
          }
          delete: {
            args: Prisma.EntrainementExerciceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload>
          }
          update: {
            args: Prisma.EntrainementExerciceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload>
          }
          deleteMany: {
            args: Prisma.EntrainementExerciceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EntrainementExerciceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EntrainementExerciceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EntrainementExercicePayload>
          }
          aggregate: {
            args: Prisma.EntrainementExerciceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEntrainementExercice>
          }
          groupBy: {
            args: Prisma.EntrainementExerciceGroupByArgs<ExtArgs>
            result: $Utils.Optional<EntrainementExerciceGroupByOutputType>[]
          }
          count: {
            args: Prisma.EntrainementExerciceCountArgs<ExtArgs>
            result: $Utils.Optional<EntrainementExerciceCountAggregateOutputType> | number
          }
        }
      }
      Echauffement: {
        payload: Prisma.$EchauffementPayload<ExtArgs>
        fields: Prisma.EchauffementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EchauffementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EchauffementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload>
          }
          findFirst: {
            args: Prisma.EchauffementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EchauffementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload>
          }
          findMany: {
            args: Prisma.EchauffementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload>[]
          }
          create: {
            args: Prisma.EchauffementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload>
          }
          createMany: {
            args: Prisma.EchauffementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EchauffementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload>[]
          }
          delete: {
            args: Prisma.EchauffementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload>
          }
          update: {
            args: Prisma.EchauffementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload>
          }
          deleteMany: {
            args: Prisma.EchauffementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EchauffementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EchauffementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EchauffementPayload>
          }
          aggregate: {
            args: Prisma.EchauffementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEchauffement>
          }
          groupBy: {
            args: Prisma.EchauffementGroupByArgs<ExtArgs>
            result: $Utils.Optional<EchauffementGroupByOutputType>[]
          }
          count: {
            args: Prisma.EchauffementCountArgs<ExtArgs>
            result: $Utils.Optional<EchauffementCountAggregateOutputType> | number
          }
        }
      }
      BlocEchauffement: {
        payload: Prisma.$BlocEchauffementPayload<ExtArgs>
        fields: Prisma.BlocEchauffementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BlocEchauffementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BlocEchauffementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload>
          }
          findFirst: {
            args: Prisma.BlocEchauffementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BlocEchauffementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload>
          }
          findMany: {
            args: Prisma.BlocEchauffementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload>[]
          }
          create: {
            args: Prisma.BlocEchauffementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload>
          }
          createMany: {
            args: Prisma.BlocEchauffementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BlocEchauffementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload>[]
          }
          delete: {
            args: Prisma.BlocEchauffementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload>
          }
          update: {
            args: Prisma.BlocEchauffementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload>
          }
          deleteMany: {
            args: Prisma.BlocEchauffementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BlocEchauffementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BlocEchauffementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlocEchauffementPayload>
          }
          aggregate: {
            args: Prisma.BlocEchauffementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBlocEchauffement>
          }
          groupBy: {
            args: Prisma.BlocEchauffementGroupByArgs<ExtArgs>
            result: $Utils.Optional<BlocEchauffementGroupByOutputType>[]
          }
          count: {
            args: Prisma.BlocEchauffementCountArgs<ExtArgs>
            result: $Utils.Optional<BlocEchauffementCountAggregateOutputType> | number
          }
        }
      }
      SituationMatch: {
        payload: Prisma.$SituationMatchPayload<ExtArgs>
        fields: Prisma.SituationMatchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SituationMatchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SituationMatchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload>
          }
          findFirst: {
            args: Prisma.SituationMatchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SituationMatchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload>
          }
          findMany: {
            args: Prisma.SituationMatchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload>[]
          }
          create: {
            args: Prisma.SituationMatchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload>
          }
          createMany: {
            args: Prisma.SituationMatchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SituationMatchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload>[]
          }
          delete: {
            args: Prisma.SituationMatchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload>
          }
          update: {
            args: Prisma.SituationMatchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload>
          }
          deleteMany: {
            args: Prisma.SituationMatchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SituationMatchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SituationMatchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SituationMatchPayload>
          }
          aggregate: {
            args: Prisma.SituationMatchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSituationMatch>
          }
          groupBy: {
            args: Prisma.SituationMatchGroupByArgs<ExtArgs>
            result: $Utils.Optional<SituationMatchGroupByOutputType>[]
          }
          count: {
            args: Prisma.SituationMatchCountArgs<ExtArgs>
            result: $Utils.Optional<SituationMatchCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ExerciceCountOutputType
   */

  export type ExerciceCountOutputType = {
    tags: number
    entrainements: number
  }

  export type ExerciceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | ExerciceCountOutputTypeCountTagsArgs
    entrainements?: boolean | ExerciceCountOutputTypeCountEntrainementsArgs
  }

  // Custom InputTypes
  /**
   * ExerciceCountOutputType without action
   */
  export type ExerciceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciceCountOutputType
     */
    select?: ExerciceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ExerciceCountOutputType without action
   */
  export type ExerciceCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
  }

  /**
   * ExerciceCountOutputType without action
   */
  export type ExerciceCountOutputTypeCountEntrainementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EntrainementExerciceWhereInput
  }


  /**
   * Count Type TagCountOutputType
   */

  export type TagCountOutputType = {
    exercices: number
    entrainements: number
    situationsMatchs: number
  }

  export type TagCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exercices?: boolean | TagCountOutputTypeCountExercicesArgs
    entrainements?: boolean | TagCountOutputTypeCountEntrainementsArgs
    situationsMatchs?: boolean | TagCountOutputTypeCountSituationsMatchsArgs
  }

  // Custom InputTypes
  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TagCountOutputType
     */
    select?: TagCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeCountExercicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExerciceWhereInput
  }

  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeCountEntrainementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EntrainementWhereInput
  }

  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeCountSituationsMatchsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SituationMatchWhereInput
  }


  /**
   * Count Type EntrainementCountOutputType
   */

  export type EntrainementCountOutputType = {
    exercices: number
    tags: number
  }

  export type EntrainementCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exercices?: boolean | EntrainementCountOutputTypeCountExercicesArgs
    tags?: boolean | EntrainementCountOutputTypeCountTagsArgs
  }

  // Custom InputTypes
  /**
   * EntrainementCountOutputType without action
   */
  export type EntrainementCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementCountOutputType
     */
    select?: EntrainementCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EntrainementCountOutputType without action
   */
  export type EntrainementCountOutputTypeCountExercicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EntrainementExerciceWhereInput
  }

  /**
   * EntrainementCountOutputType without action
   */
  export type EntrainementCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
  }


  /**
   * Count Type EchauffementCountOutputType
   */

  export type EchauffementCountOutputType = {
    blocs: number
    entrainements: number
  }

  export type EchauffementCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    blocs?: boolean | EchauffementCountOutputTypeCountBlocsArgs
    entrainements?: boolean | EchauffementCountOutputTypeCountEntrainementsArgs
  }

  // Custom InputTypes
  /**
   * EchauffementCountOutputType without action
   */
  export type EchauffementCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EchauffementCountOutputType
     */
    select?: EchauffementCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EchauffementCountOutputType without action
   */
  export type EchauffementCountOutputTypeCountBlocsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlocEchauffementWhereInput
  }

  /**
   * EchauffementCountOutputType without action
   */
  export type EchauffementCountOutputTypeCountEntrainementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EntrainementWhereInput
  }


  /**
   * Count Type SituationMatchCountOutputType
   */

  export type SituationMatchCountOutputType = {
    tags: number
    entrainements: number
  }

  export type SituationMatchCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | SituationMatchCountOutputTypeCountTagsArgs
    entrainements?: boolean | SituationMatchCountOutputTypeCountEntrainementsArgs
  }

  // Custom InputTypes
  /**
   * SituationMatchCountOutputType without action
   */
  export type SituationMatchCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatchCountOutputType
     */
    select?: SituationMatchCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SituationMatchCountOutputType without action
   */
  export type SituationMatchCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
  }

  /**
   * SituationMatchCountOutputType without action
   */
  export type SituationMatchCountOutputTypeCountEntrainementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EntrainementWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Exercice
   */

  export type AggregateExercice = {
    _count: ExerciceCountAggregateOutputType | null
    _min: ExerciceMinAggregateOutputType | null
    _max: ExerciceMaxAggregateOutputType | null
  }

  export type ExerciceMinAggregateOutputType = {
    id: string | null
    nom: string | null
    description: string | null
    imageUrl: string | null
    schemaUrl: string | null
    materiel: string | null
    notes: string | null
    variablesText: string | null
    variablesPlus: string | null
    variablesMinus: string | null
    createdAt: Date | null
  }

  export type ExerciceMaxAggregateOutputType = {
    id: string | null
    nom: string | null
    description: string | null
    imageUrl: string | null
    schemaUrl: string | null
    materiel: string | null
    notes: string | null
    variablesText: string | null
    variablesPlus: string | null
    variablesMinus: string | null
    createdAt: Date | null
  }

  export type ExerciceCountAggregateOutputType = {
    id: number
    nom: number
    description: number
    imageUrl: number
    schemaUrl: number
    materiel: number
    notes: number
    variablesText: number
    variablesPlus: number
    variablesMinus: number
    createdAt: number
    _all: number
  }


  export type ExerciceMinAggregateInputType = {
    id?: true
    nom?: true
    description?: true
    imageUrl?: true
    schemaUrl?: true
    materiel?: true
    notes?: true
    variablesText?: true
    variablesPlus?: true
    variablesMinus?: true
    createdAt?: true
  }

  export type ExerciceMaxAggregateInputType = {
    id?: true
    nom?: true
    description?: true
    imageUrl?: true
    schemaUrl?: true
    materiel?: true
    notes?: true
    variablesText?: true
    variablesPlus?: true
    variablesMinus?: true
    createdAt?: true
  }

  export type ExerciceCountAggregateInputType = {
    id?: true
    nom?: true
    description?: true
    imageUrl?: true
    schemaUrl?: true
    materiel?: true
    notes?: true
    variablesText?: true
    variablesPlus?: true
    variablesMinus?: true
    createdAt?: true
    _all?: true
  }

  export type ExerciceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Exercice to aggregate.
     */
    where?: ExerciceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exercices to fetch.
     */
    orderBy?: ExerciceOrderByWithRelationInput | ExerciceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExerciceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exercices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exercices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Exercices
    **/
    _count?: true | ExerciceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExerciceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExerciceMaxAggregateInputType
  }

  export type GetExerciceAggregateType<T extends ExerciceAggregateArgs> = {
        [P in keyof T & keyof AggregateExercice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExercice[P]>
      : GetScalarType<T[P], AggregateExercice[P]>
  }




  export type ExerciceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExerciceWhereInput
    orderBy?: ExerciceOrderByWithAggregationInput | ExerciceOrderByWithAggregationInput[]
    by: ExerciceScalarFieldEnum[] | ExerciceScalarFieldEnum
    having?: ExerciceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExerciceCountAggregateInputType | true
    _min?: ExerciceMinAggregateInputType
    _max?: ExerciceMaxAggregateInputType
  }

  export type ExerciceGroupByOutputType = {
    id: string
    nom: string
    description: string
    imageUrl: string | null
    schemaUrl: string | null
    materiel: string | null
    notes: string | null
    variablesText: string | null
    variablesPlus: string | null
    variablesMinus: string | null
    createdAt: Date
    _count: ExerciceCountAggregateOutputType | null
    _min: ExerciceMinAggregateOutputType | null
    _max: ExerciceMaxAggregateOutputType | null
  }

  type GetExerciceGroupByPayload<T extends ExerciceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExerciceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExerciceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExerciceGroupByOutputType[P]>
            : GetScalarType<T[P], ExerciceGroupByOutputType[P]>
        }
      >
    >


  export type ExerciceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nom?: boolean
    description?: boolean
    imageUrl?: boolean
    schemaUrl?: boolean
    materiel?: boolean
    notes?: boolean
    variablesText?: boolean
    variablesPlus?: boolean
    variablesMinus?: boolean
    createdAt?: boolean
    tags?: boolean | Exercice$tagsArgs<ExtArgs>
    entrainements?: boolean | Exercice$entrainementsArgs<ExtArgs>
    _count?: boolean | ExerciceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["exercice"]>

  export type ExerciceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nom?: boolean
    description?: boolean
    imageUrl?: boolean
    schemaUrl?: boolean
    materiel?: boolean
    notes?: boolean
    variablesText?: boolean
    variablesPlus?: boolean
    variablesMinus?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["exercice"]>

  export type ExerciceSelectScalar = {
    id?: boolean
    nom?: boolean
    description?: boolean
    imageUrl?: boolean
    schemaUrl?: boolean
    materiel?: boolean
    notes?: boolean
    variablesText?: boolean
    variablesPlus?: boolean
    variablesMinus?: boolean
    createdAt?: boolean
  }

  export type ExerciceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | Exercice$tagsArgs<ExtArgs>
    entrainements?: boolean | Exercice$entrainementsArgs<ExtArgs>
    _count?: boolean | ExerciceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ExerciceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ExercicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Exercice"
    objects: {
      tags: Prisma.$TagPayload<ExtArgs>[]
      entrainements: Prisma.$EntrainementExercicePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nom: string
      description: string
      imageUrl: string | null
      schemaUrl: string | null
      materiel: string | null
      notes: string | null
      variablesText: string | null
      variablesPlus: string | null
      variablesMinus: string | null
      createdAt: Date
    }, ExtArgs["result"]["exercice"]>
    composites: {}
  }

  type ExerciceGetPayload<S extends boolean | null | undefined | ExerciceDefaultArgs> = $Result.GetResult<Prisma.$ExercicePayload, S>

  type ExerciceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ExerciceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ExerciceCountAggregateInputType | true
    }

  export interface ExerciceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Exercice'], meta: { name: 'Exercice' } }
    /**
     * Find zero or one Exercice that matches the filter.
     * @param {ExerciceFindUniqueArgs} args - Arguments to find a Exercice
     * @example
     * // Get one Exercice
     * const exercice = await prisma.exercice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExerciceFindUniqueArgs>(args: SelectSubset<T, ExerciceFindUniqueArgs<ExtArgs>>): Prisma__ExerciceClient<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Exercice that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ExerciceFindUniqueOrThrowArgs} args - Arguments to find a Exercice
     * @example
     * // Get one Exercice
     * const exercice = await prisma.exercice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExerciceFindUniqueOrThrowArgs>(args: SelectSubset<T, ExerciceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExerciceClient<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Exercice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciceFindFirstArgs} args - Arguments to find a Exercice
     * @example
     * // Get one Exercice
     * const exercice = await prisma.exercice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExerciceFindFirstArgs>(args?: SelectSubset<T, ExerciceFindFirstArgs<ExtArgs>>): Prisma__ExerciceClient<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Exercice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciceFindFirstOrThrowArgs} args - Arguments to find a Exercice
     * @example
     * // Get one Exercice
     * const exercice = await prisma.exercice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExerciceFindFirstOrThrowArgs>(args?: SelectSubset<T, ExerciceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExerciceClient<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Exercices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Exercices
     * const exercices = await prisma.exercice.findMany()
     * 
     * // Get first 10 Exercices
     * const exercices = await prisma.exercice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const exerciceWithIdOnly = await prisma.exercice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExerciceFindManyArgs>(args?: SelectSubset<T, ExerciceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Exercice.
     * @param {ExerciceCreateArgs} args - Arguments to create a Exercice.
     * @example
     * // Create one Exercice
     * const Exercice = await prisma.exercice.create({
     *   data: {
     *     // ... data to create a Exercice
     *   }
     * })
     * 
     */
    create<T extends ExerciceCreateArgs>(args: SelectSubset<T, ExerciceCreateArgs<ExtArgs>>): Prisma__ExerciceClient<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Exercices.
     * @param {ExerciceCreateManyArgs} args - Arguments to create many Exercices.
     * @example
     * // Create many Exercices
     * const exercice = await prisma.exercice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExerciceCreateManyArgs>(args?: SelectSubset<T, ExerciceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Exercices and returns the data saved in the database.
     * @param {ExerciceCreateManyAndReturnArgs} args - Arguments to create many Exercices.
     * @example
     * // Create many Exercices
     * const exercice = await prisma.exercice.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Exercices and only return the `id`
     * const exerciceWithIdOnly = await prisma.exercice.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExerciceCreateManyAndReturnArgs>(args?: SelectSubset<T, ExerciceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Exercice.
     * @param {ExerciceDeleteArgs} args - Arguments to delete one Exercice.
     * @example
     * // Delete one Exercice
     * const Exercice = await prisma.exercice.delete({
     *   where: {
     *     // ... filter to delete one Exercice
     *   }
     * })
     * 
     */
    delete<T extends ExerciceDeleteArgs>(args: SelectSubset<T, ExerciceDeleteArgs<ExtArgs>>): Prisma__ExerciceClient<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Exercice.
     * @param {ExerciceUpdateArgs} args - Arguments to update one Exercice.
     * @example
     * // Update one Exercice
     * const exercice = await prisma.exercice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExerciceUpdateArgs>(args: SelectSubset<T, ExerciceUpdateArgs<ExtArgs>>): Prisma__ExerciceClient<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Exercices.
     * @param {ExerciceDeleteManyArgs} args - Arguments to filter Exercices to delete.
     * @example
     * // Delete a few Exercices
     * const { count } = await prisma.exercice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExerciceDeleteManyArgs>(args?: SelectSubset<T, ExerciceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Exercices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Exercices
     * const exercice = await prisma.exercice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExerciceUpdateManyArgs>(args: SelectSubset<T, ExerciceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Exercice.
     * @param {ExerciceUpsertArgs} args - Arguments to update or create a Exercice.
     * @example
     * // Update or create a Exercice
     * const exercice = await prisma.exercice.upsert({
     *   create: {
     *     // ... data to create a Exercice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Exercice we want to update
     *   }
     * })
     */
    upsert<T extends ExerciceUpsertArgs>(args: SelectSubset<T, ExerciceUpsertArgs<ExtArgs>>): Prisma__ExerciceClient<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Exercices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciceCountArgs} args - Arguments to filter Exercices to count.
     * @example
     * // Count the number of Exercices
     * const count = await prisma.exercice.count({
     *   where: {
     *     // ... the filter for the Exercices we want to count
     *   }
     * })
    **/
    count<T extends ExerciceCountArgs>(
      args?: Subset<T, ExerciceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExerciceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Exercice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExerciceAggregateArgs>(args: Subset<T, ExerciceAggregateArgs>): Prisma.PrismaPromise<GetExerciceAggregateType<T>>

    /**
     * Group by Exercice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExerciceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExerciceGroupByArgs['orderBy'] }
        : { orderBy?: ExerciceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExerciceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExerciceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Exercice model
   */
  readonly fields: ExerciceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Exercice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExerciceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tags<T extends Exercice$tagsArgs<ExtArgs> = {}>(args?: Subset<T, Exercice$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany"> | Null>
    entrainements<T extends Exercice$entrainementsArgs<ExtArgs> = {}>(args?: Subset<T, Exercice$entrainementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Exercice model
   */ 
  interface ExerciceFieldRefs {
    readonly id: FieldRef<"Exercice", 'String'>
    readonly nom: FieldRef<"Exercice", 'String'>
    readonly description: FieldRef<"Exercice", 'String'>
    readonly imageUrl: FieldRef<"Exercice", 'String'>
    readonly schemaUrl: FieldRef<"Exercice", 'String'>
    readonly materiel: FieldRef<"Exercice", 'String'>
    readonly notes: FieldRef<"Exercice", 'String'>
    readonly variablesText: FieldRef<"Exercice", 'String'>
    readonly variablesPlus: FieldRef<"Exercice", 'String'>
    readonly variablesMinus: FieldRef<"Exercice", 'String'>
    readonly createdAt: FieldRef<"Exercice", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Exercice findUnique
   */
  export type ExerciceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    /**
     * Filter, which Exercice to fetch.
     */
    where: ExerciceWhereUniqueInput
  }

  /**
   * Exercice findUniqueOrThrow
   */
  export type ExerciceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    /**
     * Filter, which Exercice to fetch.
     */
    where: ExerciceWhereUniqueInput
  }

  /**
   * Exercice findFirst
   */
  export type ExerciceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    /**
     * Filter, which Exercice to fetch.
     */
    where?: ExerciceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exercices to fetch.
     */
    orderBy?: ExerciceOrderByWithRelationInput | ExerciceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Exercices.
     */
    cursor?: ExerciceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exercices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exercices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Exercices.
     */
    distinct?: ExerciceScalarFieldEnum | ExerciceScalarFieldEnum[]
  }

  /**
   * Exercice findFirstOrThrow
   */
  export type ExerciceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    /**
     * Filter, which Exercice to fetch.
     */
    where?: ExerciceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exercices to fetch.
     */
    orderBy?: ExerciceOrderByWithRelationInput | ExerciceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Exercices.
     */
    cursor?: ExerciceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exercices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exercices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Exercices.
     */
    distinct?: ExerciceScalarFieldEnum | ExerciceScalarFieldEnum[]
  }

  /**
   * Exercice findMany
   */
  export type ExerciceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    /**
     * Filter, which Exercices to fetch.
     */
    where?: ExerciceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exercices to fetch.
     */
    orderBy?: ExerciceOrderByWithRelationInput | ExerciceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Exercices.
     */
    cursor?: ExerciceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exercices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exercices.
     */
    skip?: number
    distinct?: ExerciceScalarFieldEnum | ExerciceScalarFieldEnum[]
  }

  /**
   * Exercice create
   */
  export type ExerciceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    /**
     * The data needed to create a Exercice.
     */
    data: XOR<ExerciceCreateInput, ExerciceUncheckedCreateInput>
  }

  /**
   * Exercice createMany
   */
  export type ExerciceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Exercices.
     */
    data: ExerciceCreateManyInput | ExerciceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Exercice createManyAndReturn
   */
  export type ExerciceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Exercices.
     */
    data: ExerciceCreateManyInput | ExerciceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Exercice update
   */
  export type ExerciceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    /**
     * The data needed to update a Exercice.
     */
    data: XOR<ExerciceUpdateInput, ExerciceUncheckedUpdateInput>
    /**
     * Choose, which Exercice to update.
     */
    where: ExerciceWhereUniqueInput
  }

  /**
   * Exercice updateMany
   */
  export type ExerciceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Exercices.
     */
    data: XOR<ExerciceUpdateManyMutationInput, ExerciceUncheckedUpdateManyInput>
    /**
     * Filter which Exercices to update
     */
    where?: ExerciceWhereInput
  }

  /**
   * Exercice upsert
   */
  export type ExerciceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    /**
     * The filter to search for the Exercice to update in case it exists.
     */
    where: ExerciceWhereUniqueInput
    /**
     * In case the Exercice found by the `where` argument doesn't exist, create a new Exercice with this data.
     */
    create: XOR<ExerciceCreateInput, ExerciceUncheckedCreateInput>
    /**
     * In case the Exercice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExerciceUpdateInput, ExerciceUncheckedUpdateInput>
  }

  /**
   * Exercice delete
   */
  export type ExerciceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    /**
     * Filter which Exercice to delete.
     */
    where: ExerciceWhereUniqueInput
  }

  /**
   * Exercice deleteMany
   */
  export type ExerciceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Exercices to delete
     */
    where?: ExerciceWhereInput
  }

  /**
   * Exercice.tags
   */
  export type Exercice$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    where?: TagWhereInput
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    cursor?: TagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Exercice.entrainements
   */
  export type Exercice$entrainementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    where?: EntrainementExerciceWhereInput
    orderBy?: EntrainementExerciceOrderByWithRelationInput | EntrainementExerciceOrderByWithRelationInput[]
    cursor?: EntrainementExerciceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EntrainementExerciceScalarFieldEnum | EntrainementExerciceScalarFieldEnum[]
  }

  /**
   * Exercice without action
   */
  export type ExerciceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
  }


  /**
   * Model Tag
   */

  export type AggregateTag = {
    _count: TagCountAggregateOutputType | null
    _avg: TagAvgAggregateOutputType | null
    _sum: TagSumAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  export type TagAvgAggregateOutputType = {
    level: number | null
  }

  export type TagSumAggregateOutputType = {
    level: number | null
  }

  export type TagMinAggregateOutputType = {
    id: string | null
    label: string | null
    category: string | null
    color: string | null
    level: number | null
    createdAt: Date | null
  }

  export type TagMaxAggregateOutputType = {
    id: string | null
    label: string | null
    category: string | null
    color: string | null
    level: number | null
    createdAt: Date | null
  }

  export type TagCountAggregateOutputType = {
    id: number
    label: number
    category: number
    color: number
    level: number
    createdAt: number
    _all: number
  }


  export type TagAvgAggregateInputType = {
    level?: true
  }

  export type TagSumAggregateInputType = {
    level?: true
  }

  export type TagMinAggregateInputType = {
    id?: true
    label?: true
    category?: true
    color?: true
    level?: true
    createdAt?: true
  }

  export type TagMaxAggregateInputType = {
    id?: true
    label?: true
    category?: true
    color?: true
    level?: true
    createdAt?: true
  }

  export type TagCountAggregateInputType = {
    id?: true
    label?: true
    category?: true
    color?: true
    level?: true
    createdAt?: true
    _all?: true
  }

  export type TagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tag to aggregate.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tags
    **/
    _count?: true | TagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TagAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TagSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TagMaxAggregateInputType
  }

  export type GetTagAggregateType<T extends TagAggregateArgs> = {
        [P in keyof T & keyof AggregateTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTag[P]>
      : GetScalarType<T[P], AggregateTag[P]>
  }




  export type TagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
    orderBy?: TagOrderByWithAggregationInput | TagOrderByWithAggregationInput[]
    by: TagScalarFieldEnum[] | TagScalarFieldEnum
    having?: TagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TagCountAggregateInputType | true
    _avg?: TagAvgAggregateInputType
    _sum?: TagSumAggregateInputType
    _min?: TagMinAggregateInputType
    _max?: TagMaxAggregateInputType
  }

  export type TagGroupByOutputType = {
    id: string
    label: string
    category: string
    color: string | null
    level: number | null
    createdAt: Date
    _count: TagCountAggregateOutputType | null
    _avg: TagAvgAggregateOutputType | null
    _sum: TagSumAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  type GetTagGroupByPayload<T extends TagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TagGroupByOutputType[P]>
            : GetScalarType<T[P], TagGroupByOutputType[P]>
        }
      >
    >


  export type TagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    label?: boolean
    category?: boolean
    color?: boolean
    level?: boolean
    createdAt?: boolean
    exercices?: boolean | Tag$exercicesArgs<ExtArgs>
    entrainements?: boolean | Tag$entrainementsArgs<ExtArgs>
    situationsMatchs?: boolean | Tag$situationsMatchsArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tag"]>

  export type TagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    label?: boolean
    category?: boolean
    color?: boolean
    level?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["tag"]>

  export type TagSelectScalar = {
    id?: boolean
    label?: boolean
    category?: boolean
    color?: boolean
    level?: boolean
    createdAt?: boolean
  }

  export type TagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exercices?: boolean | Tag$exercicesArgs<ExtArgs>
    entrainements?: boolean | Tag$entrainementsArgs<ExtArgs>
    situationsMatchs?: boolean | Tag$situationsMatchsArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tag"
    objects: {
      exercices: Prisma.$ExercicePayload<ExtArgs>[]
      entrainements: Prisma.$EntrainementPayload<ExtArgs>[]
      situationsMatchs: Prisma.$SituationMatchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      label: string
      category: string
      color: string | null
      level: number | null
      createdAt: Date
    }, ExtArgs["result"]["tag"]>
    composites: {}
  }

  type TagGetPayload<S extends boolean | null | undefined | TagDefaultArgs> = $Result.GetResult<Prisma.$TagPayload, S>

  type TagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TagFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TagCountAggregateInputType | true
    }

  export interface TagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tag'], meta: { name: 'Tag' } }
    /**
     * Find zero or one Tag that matches the filter.
     * @param {TagFindUniqueArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TagFindUniqueArgs>(args: SelectSubset<T, TagFindUniqueArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Tag that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TagFindUniqueOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TagFindUniqueOrThrowArgs>(args: SelectSubset<T, TagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Tag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TagFindFirstArgs>(args?: SelectSubset<T, TagFindFirstArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Tag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TagFindFirstOrThrowArgs>(args?: SelectSubset<T, TagFindFirstOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tags
     * const tags = await prisma.tag.findMany()
     * 
     * // Get first 10 Tags
     * const tags = await prisma.tag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tagWithIdOnly = await prisma.tag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TagFindManyArgs>(args?: SelectSubset<T, TagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Tag.
     * @param {TagCreateArgs} args - Arguments to create a Tag.
     * @example
     * // Create one Tag
     * const Tag = await prisma.tag.create({
     *   data: {
     *     // ... data to create a Tag
     *   }
     * })
     * 
     */
    create<T extends TagCreateArgs>(args: SelectSubset<T, TagCreateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tags.
     * @param {TagCreateManyArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TagCreateManyArgs>(args?: SelectSubset<T, TagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tags and returns the data saved in the database.
     * @param {TagCreateManyAndReturnArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tags and only return the `id`
     * const tagWithIdOnly = await prisma.tag.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TagCreateManyAndReturnArgs>(args?: SelectSubset<T, TagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Tag.
     * @param {TagDeleteArgs} args - Arguments to delete one Tag.
     * @example
     * // Delete one Tag
     * const Tag = await prisma.tag.delete({
     *   where: {
     *     // ... filter to delete one Tag
     *   }
     * })
     * 
     */
    delete<T extends TagDeleteArgs>(args: SelectSubset<T, TagDeleteArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Tag.
     * @param {TagUpdateArgs} args - Arguments to update one Tag.
     * @example
     * // Update one Tag
     * const tag = await prisma.tag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TagUpdateArgs>(args: SelectSubset<T, TagUpdateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tags.
     * @param {TagDeleteManyArgs} args - Arguments to filter Tags to delete.
     * @example
     * // Delete a few Tags
     * const { count } = await prisma.tag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TagDeleteManyArgs>(args?: SelectSubset<T, TagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tags
     * const tag = await prisma.tag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TagUpdateManyArgs>(args: SelectSubset<T, TagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tag.
     * @param {TagUpsertArgs} args - Arguments to update or create a Tag.
     * @example
     * // Update or create a Tag
     * const tag = await prisma.tag.upsert({
     *   create: {
     *     // ... data to create a Tag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tag we want to update
     *   }
     * })
     */
    upsert<T extends TagUpsertArgs>(args: SelectSubset<T, TagUpsertArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagCountArgs} args - Arguments to filter Tags to count.
     * @example
     * // Count the number of Tags
     * const count = await prisma.tag.count({
     *   where: {
     *     // ... the filter for the Tags we want to count
     *   }
     * })
    **/
    count<T extends TagCountArgs>(
      args?: Subset<T, TagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TagAggregateArgs>(args: Subset<T, TagAggregateArgs>): Prisma.PrismaPromise<GetTagAggregateType<T>>

    /**
     * Group by Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TagGroupByArgs['orderBy'] }
        : { orderBy?: TagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tag model
   */
  readonly fields: TagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    exercices<T extends Tag$exercicesArgs<ExtArgs> = {}>(args?: Subset<T, Tag$exercicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "findMany"> | Null>
    entrainements<T extends Tag$entrainementsArgs<ExtArgs> = {}>(args?: Subset<T, Tag$entrainementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "findMany"> | Null>
    situationsMatchs<T extends Tag$situationsMatchsArgs<ExtArgs> = {}>(args?: Subset<T, Tag$situationsMatchsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tag model
   */ 
  interface TagFieldRefs {
    readonly id: FieldRef<"Tag", 'String'>
    readonly label: FieldRef<"Tag", 'String'>
    readonly category: FieldRef<"Tag", 'String'>
    readonly color: FieldRef<"Tag", 'String'>
    readonly level: FieldRef<"Tag", 'Int'>
    readonly createdAt: FieldRef<"Tag", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tag findUnique
   */
  export type TagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findUniqueOrThrow
   */
  export type TagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findFirst
   */
  export type TagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findFirstOrThrow
   */
  export type TagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findMany
   */
  export type TagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tags to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag create
   */
  export type TagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to create a Tag.
     */
    data: XOR<TagCreateInput, TagUncheckedCreateInput>
  }

  /**
   * Tag createMany
   */
  export type TagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag createManyAndReturn
   */
  export type TagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag update
   */
  export type TagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to update a Tag.
     */
    data: XOR<TagUpdateInput, TagUncheckedUpdateInput>
    /**
     * Choose, which Tag to update.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag updateMany
   */
  export type TagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tags.
     */
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyInput>
    /**
     * Filter which Tags to update
     */
    where?: TagWhereInput
  }

  /**
   * Tag upsert
   */
  export type TagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The filter to search for the Tag to update in case it exists.
     */
    where: TagWhereUniqueInput
    /**
     * In case the Tag found by the `where` argument doesn't exist, create a new Tag with this data.
     */
    create: XOR<TagCreateInput, TagUncheckedCreateInput>
    /**
     * In case the Tag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TagUpdateInput, TagUncheckedUpdateInput>
  }

  /**
   * Tag delete
   */
  export type TagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter which Tag to delete.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag deleteMany
   */
  export type TagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tags to delete
     */
    where?: TagWhereInput
  }

  /**
   * Tag.exercices
   */
  export type Tag$exercicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercice
     */
    select?: ExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciceInclude<ExtArgs> | null
    where?: ExerciceWhereInput
    orderBy?: ExerciceOrderByWithRelationInput | ExerciceOrderByWithRelationInput[]
    cursor?: ExerciceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExerciceScalarFieldEnum | ExerciceScalarFieldEnum[]
  }

  /**
   * Tag.entrainements
   */
  export type Tag$entrainementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    where?: EntrainementWhereInput
    orderBy?: EntrainementOrderByWithRelationInput | EntrainementOrderByWithRelationInput[]
    cursor?: EntrainementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EntrainementScalarFieldEnum | EntrainementScalarFieldEnum[]
  }

  /**
   * Tag.situationsMatchs
   */
  export type Tag$situationsMatchsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    where?: SituationMatchWhereInput
    orderBy?: SituationMatchOrderByWithRelationInput | SituationMatchOrderByWithRelationInput[]
    cursor?: SituationMatchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SituationMatchScalarFieldEnum | SituationMatchScalarFieldEnum[]
  }

  /**
   * Tag without action
   */
  export type TagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
  }


  /**
   * Model Entrainement
   */

  export type AggregateEntrainement = {
    _count: EntrainementCountAggregateOutputType | null
    _min: EntrainementMinAggregateOutputType | null
    _max: EntrainementMaxAggregateOutputType | null
  }

  export type EntrainementMinAggregateOutputType = {
    id: string | null
    titre: string | null
    date: Date | null
    imageUrl: string | null
    createdAt: Date | null
    echauffementId: string | null
    situationMatchId: string | null
  }

  export type EntrainementMaxAggregateOutputType = {
    id: string | null
    titre: string | null
    date: Date | null
    imageUrl: string | null
    createdAt: Date | null
    echauffementId: string | null
    situationMatchId: string | null
  }

  export type EntrainementCountAggregateOutputType = {
    id: number
    titre: number
    date: number
    imageUrl: number
    createdAt: number
    echauffementId: number
    situationMatchId: number
    _all: number
  }


  export type EntrainementMinAggregateInputType = {
    id?: true
    titre?: true
    date?: true
    imageUrl?: true
    createdAt?: true
    echauffementId?: true
    situationMatchId?: true
  }

  export type EntrainementMaxAggregateInputType = {
    id?: true
    titre?: true
    date?: true
    imageUrl?: true
    createdAt?: true
    echauffementId?: true
    situationMatchId?: true
  }

  export type EntrainementCountAggregateInputType = {
    id?: true
    titre?: true
    date?: true
    imageUrl?: true
    createdAt?: true
    echauffementId?: true
    situationMatchId?: true
    _all?: true
  }

  export type EntrainementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Entrainement to aggregate.
     */
    where?: EntrainementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Entrainements to fetch.
     */
    orderBy?: EntrainementOrderByWithRelationInput | EntrainementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EntrainementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Entrainements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Entrainements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Entrainements
    **/
    _count?: true | EntrainementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EntrainementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EntrainementMaxAggregateInputType
  }

  export type GetEntrainementAggregateType<T extends EntrainementAggregateArgs> = {
        [P in keyof T & keyof AggregateEntrainement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEntrainement[P]>
      : GetScalarType<T[P], AggregateEntrainement[P]>
  }




  export type EntrainementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EntrainementWhereInput
    orderBy?: EntrainementOrderByWithAggregationInput | EntrainementOrderByWithAggregationInput[]
    by: EntrainementScalarFieldEnum[] | EntrainementScalarFieldEnum
    having?: EntrainementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EntrainementCountAggregateInputType | true
    _min?: EntrainementMinAggregateInputType
    _max?: EntrainementMaxAggregateInputType
  }

  export type EntrainementGroupByOutputType = {
    id: string
    titre: string
    date: Date | null
    imageUrl: string | null
    createdAt: Date
    echauffementId: string | null
    situationMatchId: string | null
    _count: EntrainementCountAggregateOutputType | null
    _min: EntrainementMinAggregateOutputType | null
    _max: EntrainementMaxAggregateOutputType | null
  }

  type GetEntrainementGroupByPayload<T extends EntrainementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EntrainementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EntrainementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EntrainementGroupByOutputType[P]>
            : GetScalarType<T[P], EntrainementGroupByOutputType[P]>
        }
      >
    >


  export type EntrainementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titre?: boolean
    date?: boolean
    imageUrl?: boolean
    createdAt?: boolean
    echauffementId?: boolean
    situationMatchId?: boolean
    exercices?: boolean | Entrainement$exercicesArgs<ExtArgs>
    tags?: boolean | Entrainement$tagsArgs<ExtArgs>
    echauffement?: boolean | Entrainement$echauffementArgs<ExtArgs>
    situationMatch?: boolean | Entrainement$situationMatchArgs<ExtArgs>
    _count?: boolean | EntrainementCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["entrainement"]>

  export type EntrainementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titre?: boolean
    date?: boolean
    imageUrl?: boolean
    createdAt?: boolean
    echauffementId?: boolean
    situationMatchId?: boolean
    echauffement?: boolean | Entrainement$echauffementArgs<ExtArgs>
    situationMatch?: boolean | Entrainement$situationMatchArgs<ExtArgs>
  }, ExtArgs["result"]["entrainement"]>

  export type EntrainementSelectScalar = {
    id?: boolean
    titre?: boolean
    date?: boolean
    imageUrl?: boolean
    createdAt?: boolean
    echauffementId?: boolean
    situationMatchId?: boolean
  }

  export type EntrainementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exercices?: boolean | Entrainement$exercicesArgs<ExtArgs>
    tags?: boolean | Entrainement$tagsArgs<ExtArgs>
    echauffement?: boolean | Entrainement$echauffementArgs<ExtArgs>
    situationMatch?: boolean | Entrainement$situationMatchArgs<ExtArgs>
    _count?: boolean | EntrainementCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EntrainementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    echauffement?: boolean | Entrainement$echauffementArgs<ExtArgs>
    situationMatch?: boolean | Entrainement$situationMatchArgs<ExtArgs>
  }

  export type $EntrainementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Entrainement"
    objects: {
      exercices: Prisma.$EntrainementExercicePayload<ExtArgs>[]
      tags: Prisma.$TagPayload<ExtArgs>[]
      echauffement: Prisma.$EchauffementPayload<ExtArgs> | null
      situationMatch: Prisma.$SituationMatchPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      titre: string
      date: Date | null
      imageUrl: string | null
      createdAt: Date
      echauffementId: string | null
      situationMatchId: string | null
    }, ExtArgs["result"]["entrainement"]>
    composites: {}
  }

  type EntrainementGetPayload<S extends boolean | null | undefined | EntrainementDefaultArgs> = $Result.GetResult<Prisma.$EntrainementPayload, S>

  type EntrainementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EntrainementFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EntrainementCountAggregateInputType | true
    }

  export interface EntrainementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Entrainement'], meta: { name: 'Entrainement' } }
    /**
     * Find zero or one Entrainement that matches the filter.
     * @param {EntrainementFindUniqueArgs} args - Arguments to find a Entrainement
     * @example
     * // Get one Entrainement
     * const entrainement = await prisma.entrainement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EntrainementFindUniqueArgs>(args: SelectSubset<T, EntrainementFindUniqueArgs<ExtArgs>>): Prisma__EntrainementClient<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Entrainement that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EntrainementFindUniqueOrThrowArgs} args - Arguments to find a Entrainement
     * @example
     * // Get one Entrainement
     * const entrainement = await prisma.entrainement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EntrainementFindUniqueOrThrowArgs>(args: SelectSubset<T, EntrainementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EntrainementClient<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Entrainement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementFindFirstArgs} args - Arguments to find a Entrainement
     * @example
     * // Get one Entrainement
     * const entrainement = await prisma.entrainement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EntrainementFindFirstArgs>(args?: SelectSubset<T, EntrainementFindFirstArgs<ExtArgs>>): Prisma__EntrainementClient<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Entrainement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementFindFirstOrThrowArgs} args - Arguments to find a Entrainement
     * @example
     * // Get one Entrainement
     * const entrainement = await prisma.entrainement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EntrainementFindFirstOrThrowArgs>(args?: SelectSubset<T, EntrainementFindFirstOrThrowArgs<ExtArgs>>): Prisma__EntrainementClient<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Entrainements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Entrainements
     * const entrainements = await prisma.entrainement.findMany()
     * 
     * // Get first 10 Entrainements
     * const entrainements = await prisma.entrainement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const entrainementWithIdOnly = await prisma.entrainement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EntrainementFindManyArgs>(args?: SelectSubset<T, EntrainementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Entrainement.
     * @param {EntrainementCreateArgs} args - Arguments to create a Entrainement.
     * @example
     * // Create one Entrainement
     * const Entrainement = await prisma.entrainement.create({
     *   data: {
     *     // ... data to create a Entrainement
     *   }
     * })
     * 
     */
    create<T extends EntrainementCreateArgs>(args: SelectSubset<T, EntrainementCreateArgs<ExtArgs>>): Prisma__EntrainementClient<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Entrainements.
     * @param {EntrainementCreateManyArgs} args - Arguments to create many Entrainements.
     * @example
     * // Create many Entrainements
     * const entrainement = await prisma.entrainement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EntrainementCreateManyArgs>(args?: SelectSubset<T, EntrainementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Entrainements and returns the data saved in the database.
     * @param {EntrainementCreateManyAndReturnArgs} args - Arguments to create many Entrainements.
     * @example
     * // Create many Entrainements
     * const entrainement = await prisma.entrainement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Entrainements and only return the `id`
     * const entrainementWithIdOnly = await prisma.entrainement.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EntrainementCreateManyAndReturnArgs>(args?: SelectSubset<T, EntrainementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Entrainement.
     * @param {EntrainementDeleteArgs} args - Arguments to delete one Entrainement.
     * @example
     * // Delete one Entrainement
     * const Entrainement = await prisma.entrainement.delete({
     *   where: {
     *     // ... filter to delete one Entrainement
     *   }
     * })
     * 
     */
    delete<T extends EntrainementDeleteArgs>(args: SelectSubset<T, EntrainementDeleteArgs<ExtArgs>>): Prisma__EntrainementClient<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Entrainement.
     * @param {EntrainementUpdateArgs} args - Arguments to update one Entrainement.
     * @example
     * // Update one Entrainement
     * const entrainement = await prisma.entrainement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EntrainementUpdateArgs>(args: SelectSubset<T, EntrainementUpdateArgs<ExtArgs>>): Prisma__EntrainementClient<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Entrainements.
     * @param {EntrainementDeleteManyArgs} args - Arguments to filter Entrainements to delete.
     * @example
     * // Delete a few Entrainements
     * const { count } = await prisma.entrainement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EntrainementDeleteManyArgs>(args?: SelectSubset<T, EntrainementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Entrainements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Entrainements
     * const entrainement = await prisma.entrainement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EntrainementUpdateManyArgs>(args: SelectSubset<T, EntrainementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Entrainement.
     * @param {EntrainementUpsertArgs} args - Arguments to update or create a Entrainement.
     * @example
     * // Update or create a Entrainement
     * const entrainement = await prisma.entrainement.upsert({
     *   create: {
     *     // ... data to create a Entrainement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Entrainement we want to update
     *   }
     * })
     */
    upsert<T extends EntrainementUpsertArgs>(args: SelectSubset<T, EntrainementUpsertArgs<ExtArgs>>): Prisma__EntrainementClient<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Entrainements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementCountArgs} args - Arguments to filter Entrainements to count.
     * @example
     * // Count the number of Entrainements
     * const count = await prisma.entrainement.count({
     *   where: {
     *     // ... the filter for the Entrainements we want to count
     *   }
     * })
    **/
    count<T extends EntrainementCountArgs>(
      args?: Subset<T, EntrainementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EntrainementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Entrainement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EntrainementAggregateArgs>(args: Subset<T, EntrainementAggregateArgs>): Prisma.PrismaPromise<GetEntrainementAggregateType<T>>

    /**
     * Group by Entrainement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EntrainementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EntrainementGroupByArgs['orderBy'] }
        : { orderBy?: EntrainementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EntrainementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEntrainementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Entrainement model
   */
  readonly fields: EntrainementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Entrainement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EntrainementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    exercices<T extends Entrainement$exercicesArgs<ExtArgs> = {}>(args?: Subset<T, Entrainement$exercicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "findMany"> | Null>
    tags<T extends Entrainement$tagsArgs<ExtArgs> = {}>(args?: Subset<T, Entrainement$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany"> | Null>
    echauffement<T extends Entrainement$echauffementArgs<ExtArgs> = {}>(args?: Subset<T, Entrainement$echauffementArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    situationMatch<T extends Entrainement$situationMatchArgs<ExtArgs> = {}>(args?: Subset<T, Entrainement$situationMatchArgs<ExtArgs>>): Prisma__SituationMatchClient<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Entrainement model
   */ 
  interface EntrainementFieldRefs {
    readonly id: FieldRef<"Entrainement", 'String'>
    readonly titre: FieldRef<"Entrainement", 'String'>
    readonly date: FieldRef<"Entrainement", 'DateTime'>
    readonly imageUrl: FieldRef<"Entrainement", 'String'>
    readonly createdAt: FieldRef<"Entrainement", 'DateTime'>
    readonly echauffementId: FieldRef<"Entrainement", 'String'>
    readonly situationMatchId: FieldRef<"Entrainement", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Entrainement findUnique
   */
  export type EntrainementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    /**
     * Filter, which Entrainement to fetch.
     */
    where: EntrainementWhereUniqueInput
  }

  /**
   * Entrainement findUniqueOrThrow
   */
  export type EntrainementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    /**
     * Filter, which Entrainement to fetch.
     */
    where: EntrainementWhereUniqueInput
  }

  /**
   * Entrainement findFirst
   */
  export type EntrainementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    /**
     * Filter, which Entrainement to fetch.
     */
    where?: EntrainementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Entrainements to fetch.
     */
    orderBy?: EntrainementOrderByWithRelationInput | EntrainementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Entrainements.
     */
    cursor?: EntrainementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Entrainements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Entrainements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Entrainements.
     */
    distinct?: EntrainementScalarFieldEnum | EntrainementScalarFieldEnum[]
  }

  /**
   * Entrainement findFirstOrThrow
   */
  export type EntrainementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    /**
     * Filter, which Entrainement to fetch.
     */
    where?: EntrainementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Entrainements to fetch.
     */
    orderBy?: EntrainementOrderByWithRelationInput | EntrainementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Entrainements.
     */
    cursor?: EntrainementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Entrainements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Entrainements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Entrainements.
     */
    distinct?: EntrainementScalarFieldEnum | EntrainementScalarFieldEnum[]
  }

  /**
   * Entrainement findMany
   */
  export type EntrainementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    /**
     * Filter, which Entrainements to fetch.
     */
    where?: EntrainementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Entrainements to fetch.
     */
    orderBy?: EntrainementOrderByWithRelationInput | EntrainementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Entrainements.
     */
    cursor?: EntrainementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Entrainements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Entrainements.
     */
    skip?: number
    distinct?: EntrainementScalarFieldEnum | EntrainementScalarFieldEnum[]
  }

  /**
   * Entrainement create
   */
  export type EntrainementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    /**
     * The data needed to create a Entrainement.
     */
    data: XOR<EntrainementCreateInput, EntrainementUncheckedCreateInput>
  }

  /**
   * Entrainement createMany
   */
  export type EntrainementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Entrainements.
     */
    data: EntrainementCreateManyInput | EntrainementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Entrainement createManyAndReturn
   */
  export type EntrainementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Entrainements.
     */
    data: EntrainementCreateManyInput | EntrainementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Entrainement update
   */
  export type EntrainementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    /**
     * The data needed to update a Entrainement.
     */
    data: XOR<EntrainementUpdateInput, EntrainementUncheckedUpdateInput>
    /**
     * Choose, which Entrainement to update.
     */
    where: EntrainementWhereUniqueInput
  }

  /**
   * Entrainement updateMany
   */
  export type EntrainementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Entrainements.
     */
    data: XOR<EntrainementUpdateManyMutationInput, EntrainementUncheckedUpdateManyInput>
    /**
     * Filter which Entrainements to update
     */
    where?: EntrainementWhereInput
  }

  /**
   * Entrainement upsert
   */
  export type EntrainementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    /**
     * The filter to search for the Entrainement to update in case it exists.
     */
    where: EntrainementWhereUniqueInput
    /**
     * In case the Entrainement found by the `where` argument doesn't exist, create a new Entrainement with this data.
     */
    create: XOR<EntrainementCreateInput, EntrainementUncheckedCreateInput>
    /**
     * In case the Entrainement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EntrainementUpdateInput, EntrainementUncheckedUpdateInput>
  }

  /**
   * Entrainement delete
   */
  export type EntrainementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    /**
     * Filter which Entrainement to delete.
     */
    where: EntrainementWhereUniqueInput
  }

  /**
   * Entrainement deleteMany
   */
  export type EntrainementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Entrainements to delete
     */
    where?: EntrainementWhereInput
  }

  /**
   * Entrainement.exercices
   */
  export type Entrainement$exercicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    where?: EntrainementExerciceWhereInput
    orderBy?: EntrainementExerciceOrderByWithRelationInput | EntrainementExerciceOrderByWithRelationInput[]
    cursor?: EntrainementExerciceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EntrainementExerciceScalarFieldEnum | EntrainementExerciceScalarFieldEnum[]
  }

  /**
   * Entrainement.tags
   */
  export type Entrainement$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    where?: TagWhereInput
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    cursor?: TagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Entrainement.echauffement
   */
  export type Entrainement$echauffementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    where?: EchauffementWhereInput
  }

  /**
   * Entrainement.situationMatch
   */
  export type Entrainement$situationMatchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    where?: SituationMatchWhereInput
  }

  /**
   * Entrainement without action
   */
  export type EntrainementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
  }


  /**
   * Model EntrainementExercice
   */

  export type AggregateEntrainementExercice = {
    _count: EntrainementExerciceCountAggregateOutputType | null
    _avg: EntrainementExerciceAvgAggregateOutputType | null
    _sum: EntrainementExerciceSumAggregateOutputType | null
    _min: EntrainementExerciceMinAggregateOutputType | null
    _max: EntrainementExerciceMaxAggregateOutputType | null
  }

  export type EntrainementExerciceAvgAggregateOutputType = {
    ordre: number | null
    duree: number | null
  }

  export type EntrainementExerciceSumAggregateOutputType = {
    ordre: number | null
    duree: number | null
  }

  export type EntrainementExerciceMinAggregateOutputType = {
    id: string | null
    entrainementId: string | null
    exerciceId: string | null
    ordre: number | null
    duree: number | null
    notes: string | null
    createdAt: Date | null
  }

  export type EntrainementExerciceMaxAggregateOutputType = {
    id: string | null
    entrainementId: string | null
    exerciceId: string | null
    ordre: number | null
    duree: number | null
    notes: string | null
    createdAt: Date | null
  }

  export type EntrainementExerciceCountAggregateOutputType = {
    id: number
    entrainementId: number
    exerciceId: number
    ordre: number
    duree: number
    notes: number
    createdAt: number
    _all: number
  }


  export type EntrainementExerciceAvgAggregateInputType = {
    ordre?: true
    duree?: true
  }

  export type EntrainementExerciceSumAggregateInputType = {
    ordre?: true
    duree?: true
  }

  export type EntrainementExerciceMinAggregateInputType = {
    id?: true
    entrainementId?: true
    exerciceId?: true
    ordre?: true
    duree?: true
    notes?: true
    createdAt?: true
  }

  export type EntrainementExerciceMaxAggregateInputType = {
    id?: true
    entrainementId?: true
    exerciceId?: true
    ordre?: true
    duree?: true
    notes?: true
    createdAt?: true
  }

  export type EntrainementExerciceCountAggregateInputType = {
    id?: true
    entrainementId?: true
    exerciceId?: true
    ordre?: true
    duree?: true
    notes?: true
    createdAt?: true
    _all?: true
  }

  export type EntrainementExerciceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EntrainementExercice to aggregate.
     */
    where?: EntrainementExerciceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EntrainementExercices to fetch.
     */
    orderBy?: EntrainementExerciceOrderByWithRelationInput | EntrainementExerciceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EntrainementExerciceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EntrainementExercices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EntrainementExercices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EntrainementExercices
    **/
    _count?: true | EntrainementExerciceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EntrainementExerciceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EntrainementExerciceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EntrainementExerciceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EntrainementExerciceMaxAggregateInputType
  }

  export type GetEntrainementExerciceAggregateType<T extends EntrainementExerciceAggregateArgs> = {
        [P in keyof T & keyof AggregateEntrainementExercice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEntrainementExercice[P]>
      : GetScalarType<T[P], AggregateEntrainementExercice[P]>
  }




  export type EntrainementExerciceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EntrainementExerciceWhereInput
    orderBy?: EntrainementExerciceOrderByWithAggregationInput | EntrainementExerciceOrderByWithAggregationInput[]
    by: EntrainementExerciceScalarFieldEnum[] | EntrainementExerciceScalarFieldEnum
    having?: EntrainementExerciceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EntrainementExerciceCountAggregateInputType | true
    _avg?: EntrainementExerciceAvgAggregateInputType
    _sum?: EntrainementExerciceSumAggregateInputType
    _min?: EntrainementExerciceMinAggregateInputType
    _max?: EntrainementExerciceMaxAggregateInputType
  }

  export type EntrainementExerciceGroupByOutputType = {
    id: string
    entrainementId: string
    exerciceId: string
    ordre: number
    duree: number | null
    notes: string | null
    createdAt: Date
    _count: EntrainementExerciceCountAggregateOutputType | null
    _avg: EntrainementExerciceAvgAggregateOutputType | null
    _sum: EntrainementExerciceSumAggregateOutputType | null
    _min: EntrainementExerciceMinAggregateOutputType | null
    _max: EntrainementExerciceMaxAggregateOutputType | null
  }

  type GetEntrainementExerciceGroupByPayload<T extends EntrainementExerciceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EntrainementExerciceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EntrainementExerciceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EntrainementExerciceGroupByOutputType[P]>
            : GetScalarType<T[P], EntrainementExerciceGroupByOutputType[P]>
        }
      >
    >


  export type EntrainementExerciceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entrainementId?: boolean
    exerciceId?: boolean
    ordre?: boolean
    duree?: boolean
    notes?: boolean
    createdAt?: boolean
    entrainement?: boolean | EntrainementDefaultArgs<ExtArgs>
    exercice?: boolean | ExerciceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["entrainementExercice"]>

  export type EntrainementExerciceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entrainementId?: boolean
    exerciceId?: boolean
    ordre?: boolean
    duree?: boolean
    notes?: boolean
    createdAt?: boolean
    entrainement?: boolean | EntrainementDefaultArgs<ExtArgs>
    exercice?: boolean | ExerciceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["entrainementExercice"]>

  export type EntrainementExerciceSelectScalar = {
    id?: boolean
    entrainementId?: boolean
    exerciceId?: boolean
    ordre?: boolean
    duree?: boolean
    notes?: boolean
    createdAt?: boolean
  }

  export type EntrainementExerciceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    entrainement?: boolean | EntrainementDefaultArgs<ExtArgs>
    exercice?: boolean | ExerciceDefaultArgs<ExtArgs>
  }
  export type EntrainementExerciceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    entrainement?: boolean | EntrainementDefaultArgs<ExtArgs>
    exercice?: boolean | ExerciceDefaultArgs<ExtArgs>
  }

  export type $EntrainementExercicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EntrainementExercice"
    objects: {
      entrainement: Prisma.$EntrainementPayload<ExtArgs>
      exercice: Prisma.$ExercicePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      entrainementId: string
      exerciceId: string
      ordre: number
      duree: number | null
      notes: string | null
      createdAt: Date
    }, ExtArgs["result"]["entrainementExercice"]>
    composites: {}
  }

  type EntrainementExerciceGetPayload<S extends boolean | null | undefined | EntrainementExerciceDefaultArgs> = $Result.GetResult<Prisma.$EntrainementExercicePayload, S>

  type EntrainementExerciceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EntrainementExerciceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EntrainementExerciceCountAggregateInputType | true
    }

  export interface EntrainementExerciceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EntrainementExercice'], meta: { name: 'EntrainementExercice' } }
    /**
     * Find zero or one EntrainementExercice that matches the filter.
     * @param {EntrainementExerciceFindUniqueArgs} args - Arguments to find a EntrainementExercice
     * @example
     * // Get one EntrainementExercice
     * const entrainementExercice = await prisma.entrainementExercice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EntrainementExerciceFindUniqueArgs>(args: SelectSubset<T, EntrainementExerciceFindUniqueArgs<ExtArgs>>): Prisma__EntrainementExerciceClient<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one EntrainementExercice that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EntrainementExerciceFindUniqueOrThrowArgs} args - Arguments to find a EntrainementExercice
     * @example
     * // Get one EntrainementExercice
     * const entrainementExercice = await prisma.entrainementExercice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EntrainementExerciceFindUniqueOrThrowArgs>(args: SelectSubset<T, EntrainementExerciceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EntrainementExerciceClient<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first EntrainementExercice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementExerciceFindFirstArgs} args - Arguments to find a EntrainementExercice
     * @example
     * // Get one EntrainementExercice
     * const entrainementExercice = await prisma.entrainementExercice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EntrainementExerciceFindFirstArgs>(args?: SelectSubset<T, EntrainementExerciceFindFirstArgs<ExtArgs>>): Prisma__EntrainementExerciceClient<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first EntrainementExercice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementExerciceFindFirstOrThrowArgs} args - Arguments to find a EntrainementExercice
     * @example
     * // Get one EntrainementExercice
     * const entrainementExercice = await prisma.entrainementExercice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EntrainementExerciceFindFirstOrThrowArgs>(args?: SelectSubset<T, EntrainementExerciceFindFirstOrThrowArgs<ExtArgs>>): Prisma__EntrainementExerciceClient<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more EntrainementExercices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementExerciceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EntrainementExercices
     * const entrainementExercices = await prisma.entrainementExercice.findMany()
     * 
     * // Get first 10 EntrainementExercices
     * const entrainementExercices = await prisma.entrainementExercice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const entrainementExerciceWithIdOnly = await prisma.entrainementExercice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EntrainementExerciceFindManyArgs>(args?: SelectSubset<T, EntrainementExerciceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a EntrainementExercice.
     * @param {EntrainementExerciceCreateArgs} args - Arguments to create a EntrainementExercice.
     * @example
     * // Create one EntrainementExercice
     * const EntrainementExercice = await prisma.entrainementExercice.create({
     *   data: {
     *     // ... data to create a EntrainementExercice
     *   }
     * })
     * 
     */
    create<T extends EntrainementExerciceCreateArgs>(args: SelectSubset<T, EntrainementExerciceCreateArgs<ExtArgs>>): Prisma__EntrainementExerciceClient<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many EntrainementExercices.
     * @param {EntrainementExerciceCreateManyArgs} args - Arguments to create many EntrainementExercices.
     * @example
     * // Create many EntrainementExercices
     * const entrainementExercice = await prisma.entrainementExercice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EntrainementExerciceCreateManyArgs>(args?: SelectSubset<T, EntrainementExerciceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EntrainementExercices and returns the data saved in the database.
     * @param {EntrainementExerciceCreateManyAndReturnArgs} args - Arguments to create many EntrainementExercices.
     * @example
     * // Create many EntrainementExercices
     * const entrainementExercice = await prisma.entrainementExercice.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EntrainementExercices and only return the `id`
     * const entrainementExerciceWithIdOnly = await prisma.entrainementExercice.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EntrainementExerciceCreateManyAndReturnArgs>(args?: SelectSubset<T, EntrainementExerciceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a EntrainementExercice.
     * @param {EntrainementExerciceDeleteArgs} args - Arguments to delete one EntrainementExercice.
     * @example
     * // Delete one EntrainementExercice
     * const EntrainementExercice = await prisma.entrainementExercice.delete({
     *   where: {
     *     // ... filter to delete one EntrainementExercice
     *   }
     * })
     * 
     */
    delete<T extends EntrainementExerciceDeleteArgs>(args: SelectSubset<T, EntrainementExerciceDeleteArgs<ExtArgs>>): Prisma__EntrainementExerciceClient<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one EntrainementExercice.
     * @param {EntrainementExerciceUpdateArgs} args - Arguments to update one EntrainementExercice.
     * @example
     * // Update one EntrainementExercice
     * const entrainementExercice = await prisma.entrainementExercice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EntrainementExerciceUpdateArgs>(args: SelectSubset<T, EntrainementExerciceUpdateArgs<ExtArgs>>): Prisma__EntrainementExerciceClient<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more EntrainementExercices.
     * @param {EntrainementExerciceDeleteManyArgs} args - Arguments to filter EntrainementExercices to delete.
     * @example
     * // Delete a few EntrainementExercices
     * const { count } = await prisma.entrainementExercice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EntrainementExerciceDeleteManyArgs>(args?: SelectSubset<T, EntrainementExerciceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EntrainementExercices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementExerciceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EntrainementExercices
     * const entrainementExercice = await prisma.entrainementExercice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EntrainementExerciceUpdateManyArgs>(args: SelectSubset<T, EntrainementExerciceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EntrainementExercice.
     * @param {EntrainementExerciceUpsertArgs} args - Arguments to update or create a EntrainementExercice.
     * @example
     * // Update or create a EntrainementExercice
     * const entrainementExercice = await prisma.entrainementExercice.upsert({
     *   create: {
     *     // ... data to create a EntrainementExercice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EntrainementExercice we want to update
     *   }
     * })
     */
    upsert<T extends EntrainementExerciceUpsertArgs>(args: SelectSubset<T, EntrainementExerciceUpsertArgs<ExtArgs>>): Prisma__EntrainementExerciceClient<$Result.GetResult<Prisma.$EntrainementExercicePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of EntrainementExercices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementExerciceCountArgs} args - Arguments to filter EntrainementExercices to count.
     * @example
     * // Count the number of EntrainementExercices
     * const count = await prisma.entrainementExercice.count({
     *   where: {
     *     // ... the filter for the EntrainementExercices we want to count
     *   }
     * })
    **/
    count<T extends EntrainementExerciceCountArgs>(
      args?: Subset<T, EntrainementExerciceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EntrainementExerciceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EntrainementExercice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementExerciceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EntrainementExerciceAggregateArgs>(args: Subset<T, EntrainementExerciceAggregateArgs>): Prisma.PrismaPromise<GetEntrainementExerciceAggregateType<T>>

    /**
     * Group by EntrainementExercice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EntrainementExerciceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EntrainementExerciceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EntrainementExerciceGroupByArgs['orderBy'] }
        : { orderBy?: EntrainementExerciceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EntrainementExerciceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEntrainementExerciceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EntrainementExercice model
   */
  readonly fields: EntrainementExerciceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EntrainementExercice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EntrainementExerciceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    entrainement<T extends EntrainementDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EntrainementDefaultArgs<ExtArgs>>): Prisma__EntrainementClient<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    exercice<T extends ExerciceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ExerciceDefaultArgs<ExtArgs>>): Prisma__ExerciceClient<$Result.GetResult<Prisma.$ExercicePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EntrainementExercice model
   */ 
  interface EntrainementExerciceFieldRefs {
    readonly id: FieldRef<"EntrainementExercice", 'String'>
    readonly entrainementId: FieldRef<"EntrainementExercice", 'String'>
    readonly exerciceId: FieldRef<"EntrainementExercice", 'String'>
    readonly ordre: FieldRef<"EntrainementExercice", 'Int'>
    readonly duree: FieldRef<"EntrainementExercice", 'Int'>
    readonly notes: FieldRef<"EntrainementExercice", 'String'>
    readonly createdAt: FieldRef<"EntrainementExercice", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EntrainementExercice findUnique
   */
  export type EntrainementExerciceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    /**
     * Filter, which EntrainementExercice to fetch.
     */
    where: EntrainementExerciceWhereUniqueInput
  }

  /**
   * EntrainementExercice findUniqueOrThrow
   */
  export type EntrainementExerciceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    /**
     * Filter, which EntrainementExercice to fetch.
     */
    where: EntrainementExerciceWhereUniqueInput
  }

  /**
   * EntrainementExercice findFirst
   */
  export type EntrainementExerciceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    /**
     * Filter, which EntrainementExercice to fetch.
     */
    where?: EntrainementExerciceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EntrainementExercices to fetch.
     */
    orderBy?: EntrainementExerciceOrderByWithRelationInput | EntrainementExerciceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EntrainementExercices.
     */
    cursor?: EntrainementExerciceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EntrainementExercices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EntrainementExercices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EntrainementExercices.
     */
    distinct?: EntrainementExerciceScalarFieldEnum | EntrainementExerciceScalarFieldEnum[]
  }

  /**
   * EntrainementExercice findFirstOrThrow
   */
  export type EntrainementExerciceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    /**
     * Filter, which EntrainementExercice to fetch.
     */
    where?: EntrainementExerciceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EntrainementExercices to fetch.
     */
    orderBy?: EntrainementExerciceOrderByWithRelationInput | EntrainementExerciceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EntrainementExercices.
     */
    cursor?: EntrainementExerciceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EntrainementExercices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EntrainementExercices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EntrainementExercices.
     */
    distinct?: EntrainementExerciceScalarFieldEnum | EntrainementExerciceScalarFieldEnum[]
  }

  /**
   * EntrainementExercice findMany
   */
  export type EntrainementExerciceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    /**
     * Filter, which EntrainementExercices to fetch.
     */
    where?: EntrainementExerciceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EntrainementExercices to fetch.
     */
    orderBy?: EntrainementExerciceOrderByWithRelationInput | EntrainementExerciceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EntrainementExercices.
     */
    cursor?: EntrainementExerciceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EntrainementExercices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EntrainementExercices.
     */
    skip?: number
    distinct?: EntrainementExerciceScalarFieldEnum | EntrainementExerciceScalarFieldEnum[]
  }

  /**
   * EntrainementExercice create
   */
  export type EntrainementExerciceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    /**
     * The data needed to create a EntrainementExercice.
     */
    data: XOR<EntrainementExerciceCreateInput, EntrainementExerciceUncheckedCreateInput>
  }

  /**
   * EntrainementExercice createMany
   */
  export type EntrainementExerciceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EntrainementExercices.
     */
    data: EntrainementExerciceCreateManyInput | EntrainementExerciceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EntrainementExercice createManyAndReturn
   */
  export type EntrainementExerciceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many EntrainementExercices.
     */
    data: EntrainementExerciceCreateManyInput | EntrainementExerciceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EntrainementExercice update
   */
  export type EntrainementExerciceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    /**
     * The data needed to update a EntrainementExercice.
     */
    data: XOR<EntrainementExerciceUpdateInput, EntrainementExerciceUncheckedUpdateInput>
    /**
     * Choose, which EntrainementExercice to update.
     */
    where: EntrainementExerciceWhereUniqueInput
  }

  /**
   * EntrainementExercice updateMany
   */
  export type EntrainementExerciceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EntrainementExercices.
     */
    data: XOR<EntrainementExerciceUpdateManyMutationInput, EntrainementExerciceUncheckedUpdateManyInput>
    /**
     * Filter which EntrainementExercices to update
     */
    where?: EntrainementExerciceWhereInput
  }

  /**
   * EntrainementExercice upsert
   */
  export type EntrainementExerciceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    /**
     * The filter to search for the EntrainementExercice to update in case it exists.
     */
    where: EntrainementExerciceWhereUniqueInput
    /**
     * In case the EntrainementExercice found by the `where` argument doesn't exist, create a new EntrainementExercice with this data.
     */
    create: XOR<EntrainementExerciceCreateInput, EntrainementExerciceUncheckedCreateInput>
    /**
     * In case the EntrainementExercice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EntrainementExerciceUpdateInput, EntrainementExerciceUncheckedUpdateInput>
  }

  /**
   * EntrainementExercice delete
   */
  export type EntrainementExerciceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
    /**
     * Filter which EntrainementExercice to delete.
     */
    where: EntrainementExerciceWhereUniqueInput
  }

  /**
   * EntrainementExercice deleteMany
   */
  export type EntrainementExerciceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EntrainementExercices to delete
     */
    where?: EntrainementExerciceWhereInput
  }

  /**
   * EntrainementExercice without action
   */
  export type EntrainementExerciceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EntrainementExercice
     */
    select?: EntrainementExerciceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementExerciceInclude<ExtArgs> | null
  }


  /**
   * Model Echauffement
   */

  export type AggregateEchauffement = {
    _count: EchauffementCountAggregateOutputType | null
    _min: EchauffementMinAggregateOutputType | null
    _max: EchauffementMaxAggregateOutputType | null
  }

  export type EchauffementMinAggregateOutputType = {
    id: string | null
    nom: string | null
    description: string | null
    imageUrl: string | null
    createdAt: Date | null
  }

  export type EchauffementMaxAggregateOutputType = {
    id: string | null
    nom: string | null
    description: string | null
    imageUrl: string | null
    createdAt: Date | null
  }

  export type EchauffementCountAggregateOutputType = {
    id: number
    nom: number
    description: number
    imageUrl: number
    createdAt: number
    _all: number
  }


  export type EchauffementMinAggregateInputType = {
    id?: true
    nom?: true
    description?: true
    imageUrl?: true
    createdAt?: true
  }

  export type EchauffementMaxAggregateInputType = {
    id?: true
    nom?: true
    description?: true
    imageUrl?: true
    createdAt?: true
  }

  export type EchauffementCountAggregateInputType = {
    id?: true
    nom?: true
    description?: true
    imageUrl?: true
    createdAt?: true
    _all?: true
  }

  export type EchauffementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Echauffement to aggregate.
     */
    where?: EchauffementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Echauffements to fetch.
     */
    orderBy?: EchauffementOrderByWithRelationInput | EchauffementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EchauffementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Echauffements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Echauffements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Echauffements
    **/
    _count?: true | EchauffementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EchauffementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EchauffementMaxAggregateInputType
  }

  export type GetEchauffementAggregateType<T extends EchauffementAggregateArgs> = {
        [P in keyof T & keyof AggregateEchauffement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEchauffement[P]>
      : GetScalarType<T[P], AggregateEchauffement[P]>
  }




  export type EchauffementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EchauffementWhereInput
    orderBy?: EchauffementOrderByWithAggregationInput | EchauffementOrderByWithAggregationInput[]
    by: EchauffementScalarFieldEnum[] | EchauffementScalarFieldEnum
    having?: EchauffementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EchauffementCountAggregateInputType | true
    _min?: EchauffementMinAggregateInputType
    _max?: EchauffementMaxAggregateInputType
  }

  export type EchauffementGroupByOutputType = {
    id: string
    nom: string
    description: string | null
    imageUrl: string | null
    createdAt: Date
    _count: EchauffementCountAggregateOutputType | null
    _min: EchauffementMinAggregateOutputType | null
    _max: EchauffementMaxAggregateOutputType | null
  }

  type GetEchauffementGroupByPayload<T extends EchauffementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EchauffementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EchauffementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EchauffementGroupByOutputType[P]>
            : GetScalarType<T[P], EchauffementGroupByOutputType[P]>
        }
      >
    >


  export type EchauffementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nom?: boolean
    description?: boolean
    imageUrl?: boolean
    createdAt?: boolean
    blocs?: boolean | Echauffement$blocsArgs<ExtArgs>
    entrainements?: boolean | Echauffement$entrainementsArgs<ExtArgs>
    _count?: boolean | EchauffementCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["echauffement"]>

  export type EchauffementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nom?: boolean
    description?: boolean
    imageUrl?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["echauffement"]>

  export type EchauffementSelectScalar = {
    id?: boolean
    nom?: boolean
    description?: boolean
    imageUrl?: boolean
    createdAt?: boolean
  }

  export type EchauffementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    blocs?: boolean | Echauffement$blocsArgs<ExtArgs>
    entrainements?: boolean | Echauffement$entrainementsArgs<ExtArgs>
    _count?: boolean | EchauffementCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EchauffementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $EchauffementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Echauffement"
    objects: {
      blocs: Prisma.$BlocEchauffementPayload<ExtArgs>[]
      entrainements: Prisma.$EntrainementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nom: string
      description: string | null
      imageUrl: string | null
      createdAt: Date
    }, ExtArgs["result"]["echauffement"]>
    composites: {}
  }

  type EchauffementGetPayload<S extends boolean | null | undefined | EchauffementDefaultArgs> = $Result.GetResult<Prisma.$EchauffementPayload, S>

  type EchauffementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EchauffementFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EchauffementCountAggregateInputType | true
    }

  export interface EchauffementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Echauffement'], meta: { name: 'Echauffement' } }
    /**
     * Find zero or one Echauffement that matches the filter.
     * @param {EchauffementFindUniqueArgs} args - Arguments to find a Echauffement
     * @example
     * // Get one Echauffement
     * const echauffement = await prisma.echauffement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EchauffementFindUniqueArgs>(args: SelectSubset<T, EchauffementFindUniqueArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Echauffement that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EchauffementFindUniqueOrThrowArgs} args - Arguments to find a Echauffement
     * @example
     * // Get one Echauffement
     * const echauffement = await prisma.echauffement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EchauffementFindUniqueOrThrowArgs>(args: SelectSubset<T, EchauffementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Echauffement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EchauffementFindFirstArgs} args - Arguments to find a Echauffement
     * @example
     * // Get one Echauffement
     * const echauffement = await prisma.echauffement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EchauffementFindFirstArgs>(args?: SelectSubset<T, EchauffementFindFirstArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Echauffement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EchauffementFindFirstOrThrowArgs} args - Arguments to find a Echauffement
     * @example
     * // Get one Echauffement
     * const echauffement = await prisma.echauffement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EchauffementFindFirstOrThrowArgs>(args?: SelectSubset<T, EchauffementFindFirstOrThrowArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Echauffements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EchauffementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Echauffements
     * const echauffements = await prisma.echauffement.findMany()
     * 
     * // Get first 10 Echauffements
     * const echauffements = await prisma.echauffement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const echauffementWithIdOnly = await prisma.echauffement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EchauffementFindManyArgs>(args?: SelectSubset<T, EchauffementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Echauffement.
     * @param {EchauffementCreateArgs} args - Arguments to create a Echauffement.
     * @example
     * // Create one Echauffement
     * const Echauffement = await prisma.echauffement.create({
     *   data: {
     *     // ... data to create a Echauffement
     *   }
     * })
     * 
     */
    create<T extends EchauffementCreateArgs>(args: SelectSubset<T, EchauffementCreateArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Echauffements.
     * @param {EchauffementCreateManyArgs} args - Arguments to create many Echauffements.
     * @example
     * // Create many Echauffements
     * const echauffement = await prisma.echauffement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EchauffementCreateManyArgs>(args?: SelectSubset<T, EchauffementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Echauffements and returns the data saved in the database.
     * @param {EchauffementCreateManyAndReturnArgs} args - Arguments to create many Echauffements.
     * @example
     * // Create many Echauffements
     * const echauffement = await prisma.echauffement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Echauffements and only return the `id`
     * const echauffementWithIdOnly = await prisma.echauffement.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EchauffementCreateManyAndReturnArgs>(args?: SelectSubset<T, EchauffementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Echauffement.
     * @param {EchauffementDeleteArgs} args - Arguments to delete one Echauffement.
     * @example
     * // Delete one Echauffement
     * const Echauffement = await prisma.echauffement.delete({
     *   where: {
     *     // ... filter to delete one Echauffement
     *   }
     * })
     * 
     */
    delete<T extends EchauffementDeleteArgs>(args: SelectSubset<T, EchauffementDeleteArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Echauffement.
     * @param {EchauffementUpdateArgs} args - Arguments to update one Echauffement.
     * @example
     * // Update one Echauffement
     * const echauffement = await prisma.echauffement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EchauffementUpdateArgs>(args: SelectSubset<T, EchauffementUpdateArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Echauffements.
     * @param {EchauffementDeleteManyArgs} args - Arguments to filter Echauffements to delete.
     * @example
     * // Delete a few Echauffements
     * const { count } = await prisma.echauffement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EchauffementDeleteManyArgs>(args?: SelectSubset<T, EchauffementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Echauffements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EchauffementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Echauffements
     * const echauffement = await prisma.echauffement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EchauffementUpdateManyArgs>(args: SelectSubset<T, EchauffementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Echauffement.
     * @param {EchauffementUpsertArgs} args - Arguments to update or create a Echauffement.
     * @example
     * // Update or create a Echauffement
     * const echauffement = await prisma.echauffement.upsert({
     *   create: {
     *     // ... data to create a Echauffement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Echauffement we want to update
     *   }
     * })
     */
    upsert<T extends EchauffementUpsertArgs>(args: SelectSubset<T, EchauffementUpsertArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Echauffements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EchauffementCountArgs} args - Arguments to filter Echauffements to count.
     * @example
     * // Count the number of Echauffements
     * const count = await prisma.echauffement.count({
     *   where: {
     *     // ... the filter for the Echauffements we want to count
     *   }
     * })
    **/
    count<T extends EchauffementCountArgs>(
      args?: Subset<T, EchauffementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EchauffementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Echauffement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EchauffementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EchauffementAggregateArgs>(args: Subset<T, EchauffementAggregateArgs>): Prisma.PrismaPromise<GetEchauffementAggregateType<T>>

    /**
     * Group by Echauffement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EchauffementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EchauffementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EchauffementGroupByArgs['orderBy'] }
        : { orderBy?: EchauffementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EchauffementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEchauffementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Echauffement model
   */
  readonly fields: EchauffementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Echauffement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EchauffementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    blocs<T extends Echauffement$blocsArgs<ExtArgs> = {}>(args?: Subset<T, Echauffement$blocsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "findMany"> | Null>
    entrainements<T extends Echauffement$entrainementsArgs<ExtArgs> = {}>(args?: Subset<T, Echauffement$entrainementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Echauffement model
   */ 
  interface EchauffementFieldRefs {
    readonly id: FieldRef<"Echauffement", 'String'>
    readonly nom: FieldRef<"Echauffement", 'String'>
    readonly description: FieldRef<"Echauffement", 'String'>
    readonly imageUrl: FieldRef<"Echauffement", 'String'>
    readonly createdAt: FieldRef<"Echauffement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Echauffement findUnique
   */
  export type EchauffementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    /**
     * Filter, which Echauffement to fetch.
     */
    where: EchauffementWhereUniqueInput
  }

  /**
   * Echauffement findUniqueOrThrow
   */
  export type EchauffementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    /**
     * Filter, which Echauffement to fetch.
     */
    where: EchauffementWhereUniqueInput
  }

  /**
   * Echauffement findFirst
   */
  export type EchauffementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    /**
     * Filter, which Echauffement to fetch.
     */
    where?: EchauffementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Echauffements to fetch.
     */
    orderBy?: EchauffementOrderByWithRelationInput | EchauffementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Echauffements.
     */
    cursor?: EchauffementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Echauffements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Echauffements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Echauffements.
     */
    distinct?: EchauffementScalarFieldEnum | EchauffementScalarFieldEnum[]
  }

  /**
   * Echauffement findFirstOrThrow
   */
  export type EchauffementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    /**
     * Filter, which Echauffement to fetch.
     */
    where?: EchauffementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Echauffements to fetch.
     */
    orderBy?: EchauffementOrderByWithRelationInput | EchauffementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Echauffements.
     */
    cursor?: EchauffementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Echauffements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Echauffements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Echauffements.
     */
    distinct?: EchauffementScalarFieldEnum | EchauffementScalarFieldEnum[]
  }

  /**
   * Echauffement findMany
   */
  export type EchauffementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    /**
     * Filter, which Echauffements to fetch.
     */
    where?: EchauffementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Echauffements to fetch.
     */
    orderBy?: EchauffementOrderByWithRelationInput | EchauffementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Echauffements.
     */
    cursor?: EchauffementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Echauffements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Echauffements.
     */
    skip?: number
    distinct?: EchauffementScalarFieldEnum | EchauffementScalarFieldEnum[]
  }

  /**
   * Echauffement create
   */
  export type EchauffementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    /**
     * The data needed to create a Echauffement.
     */
    data: XOR<EchauffementCreateInput, EchauffementUncheckedCreateInput>
  }

  /**
   * Echauffement createMany
   */
  export type EchauffementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Echauffements.
     */
    data: EchauffementCreateManyInput | EchauffementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Echauffement createManyAndReturn
   */
  export type EchauffementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Echauffements.
     */
    data: EchauffementCreateManyInput | EchauffementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Echauffement update
   */
  export type EchauffementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    /**
     * The data needed to update a Echauffement.
     */
    data: XOR<EchauffementUpdateInput, EchauffementUncheckedUpdateInput>
    /**
     * Choose, which Echauffement to update.
     */
    where: EchauffementWhereUniqueInput
  }

  /**
   * Echauffement updateMany
   */
  export type EchauffementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Echauffements.
     */
    data: XOR<EchauffementUpdateManyMutationInput, EchauffementUncheckedUpdateManyInput>
    /**
     * Filter which Echauffements to update
     */
    where?: EchauffementWhereInput
  }

  /**
   * Echauffement upsert
   */
  export type EchauffementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    /**
     * The filter to search for the Echauffement to update in case it exists.
     */
    where: EchauffementWhereUniqueInput
    /**
     * In case the Echauffement found by the `where` argument doesn't exist, create a new Echauffement with this data.
     */
    create: XOR<EchauffementCreateInput, EchauffementUncheckedCreateInput>
    /**
     * In case the Echauffement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EchauffementUpdateInput, EchauffementUncheckedUpdateInput>
  }

  /**
   * Echauffement delete
   */
  export type EchauffementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
    /**
     * Filter which Echauffement to delete.
     */
    where: EchauffementWhereUniqueInput
  }

  /**
   * Echauffement deleteMany
   */
  export type EchauffementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Echauffements to delete
     */
    where?: EchauffementWhereInput
  }

  /**
   * Echauffement.blocs
   */
  export type Echauffement$blocsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    where?: BlocEchauffementWhereInput
    orderBy?: BlocEchauffementOrderByWithRelationInput | BlocEchauffementOrderByWithRelationInput[]
    cursor?: BlocEchauffementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BlocEchauffementScalarFieldEnum | BlocEchauffementScalarFieldEnum[]
  }

  /**
   * Echauffement.entrainements
   */
  export type Echauffement$entrainementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    where?: EntrainementWhereInput
    orderBy?: EntrainementOrderByWithRelationInput | EntrainementOrderByWithRelationInput[]
    cursor?: EntrainementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EntrainementScalarFieldEnum | EntrainementScalarFieldEnum[]
  }

  /**
   * Echauffement without action
   */
  export type EchauffementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Echauffement
     */
    select?: EchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EchauffementInclude<ExtArgs> | null
  }


  /**
   * Model BlocEchauffement
   */

  export type AggregateBlocEchauffement = {
    _count: BlocEchauffementCountAggregateOutputType | null
    _avg: BlocEchauffementAvgAggregateOutputType | null
    _sum: BlocEchauffementSumAggregateOutputType | null
    _min: BlocEchauffementMinAggregateOutputType | null
    _max: BlocEchauffementMaxAggregateOutputType | null
  }

  export type BlocEchauffementAvgAggregateOutputType = {
    ordre: number | null
  }

  export type BlocEchauffementSumAggregateOutputType = {
    ordre: number | null
  }

  export type BlocEchauffementMinAggregateOutputType = {
    id: string | null
    echauffementId: string | null
    ordre: number | null
    titre: string | null
    repetitions: string | null
    temps: string | null
    informations: string | null
    fonctionnement: string | null
    notes: string | null
    createdAt: Date | null
  }

  export type BlocEchauffementMaxAggregateOutputType = {
    id: string | null
    echauffementId: string | null
    ordre: number | null
    titre: string | null
    repetitions: string | null
    temps: string | null
    informations: string | null
    fonctionnement: string | null
    notes: string | null
    createdAt: Date | null
  }

  export type BlocEchauffementCountAggregateOutputType = {
    id: number
    echauffementId: number
    ordre: number
    titre: number
    repetitions: number
    temps: number
    informations: number
    fonctionnement: number
    notes: number
    createdAt: number
    _all: number
  }


  export type BlocEchauffementAvgAggregateInputType = {
    ordre?: true
  }

  export type BlocEchauffementSumAggregateInputType = {
    ordre?: true
  }

  export type BlocEchauffementMinAggregateInputType = {
    id?: true
    echauffementId?: true
    ordre?: true
    titre?: true
    repetitions?: true
    temps?: true
    informations?: true
    fonctionnement?: true
    notes?: true
    createdAt?: true
  }

  export type BlocEchauffementMaxAggregateInputType = {
    id?: true
    echauffementId?: true
    ordre?: true
    titre?: true
    repetitions?: true
    temps?: true
    informations?: true
    fonctionnement?: true
    notes?: true
    createdAt?: true
  }

  export type BlocEchauffementCountAggregateInputType = {
    id?: true
    echauffementId?: true
    ordre?: true
    titre?: true
    repetitions?: true
    temps?: true
    informations?: true
    fonctionnement?: true
    notes?: true
    createdAt?: true
    _all?: true
  }

  export type BlocEchauffementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlocEchauffement to aggregate.
     */
    where?: BlocEchauffementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlocEchauffements to fetch.
     */
    orderBy?: BlocEchauffementOrderByWithRelationInput | BlocEchauffementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BlocEchauffementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlocEchauffements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlocEchauffements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BlocEchauffements
    **/
    _count?: true | BlocEchauffementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BlocEchauffementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BlocEchauffementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BlocEchauffementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BlocEchauffementMaxAggregateInputType
  }

  export type GetBlocEchauffementAggregateType<T extends BlocEchauffementAggregateArgs> = {
        [P in keyof T & keyof AggregateBlocEchauffement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBlocEchauffement[P]>
      : GetScalarType<T[P], AggregateBlocEchauffement[P]>
  }




  export type BlocEchauffementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlocEchauffementWhereInput
    orderBy?: BlocEchauffementOrderByWithAggregationInput | BlocEchauffementOrderByWithAggregationInput[]
    by: BlocEchauffementScalarFieldEnum[] | BlocEchauffementScalarFieldEnum
    having?: BlocEchauffementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BlocEchauffementCountAggregateInputType | true
    _avg?: BlocEchauffementAvgAggregateInputType
    _sum?: BlocEchauffementSumAggregateInputType
    _min?: BlocEchauffementMinAggregateInputType
    _max?: BlocEchauffementMaxAggregateInputType
  }

  export type BlocEchauffementGroupByOutputType = {
    id: string
    echauffementId: string
    ordre: number
    titre: string
    repetitions: string | null
    temps: string | null
    informations: string | null
    fonctionnement: string | null
    notes: string | null
    createdAt: Date
    _count: BlocEchauffementCountAggregateOutputType | null
    _avg: BlocEchauffementAvgAggregateOutputType | null
    _sum: BlocEchauffementSumAggregateOutputType | null
    _min: BlocEchauffementMinAggregateOutputType | null
    _max: BlocEchauffementMaxAggregateOutputType | null
  }

  type GetBlocEchauffementGroupByPayload<T extends BlocEchauffementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BlocEchauffementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BlocEchauffementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BlocEchauffementGroupByOutputType[P]>
            : GetScalarType<T[P], BlocEchauffementGroupByOutputType[P]>
        }
      >
    >


  export type BlocEchauffementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    echauffementId?: boolean
    ordre?: boolean
    titre?: boolean
    repetitions?: boolean
    temps?: boolean
    informations?: boolean
    fonctionnement?: boolean
    notes?: boolean
    createdAt?: boolean
    echauffement?: boolean | EchauffementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blocEchauffement"]>

  export type BlocEchauffementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    echauffementId?: boolean
    ordre?: boolean
    titre?: boolean
    repetitions?: boolean
    temps?: boolean
    informations?: boolean
    fonctionnement?: boolean
    notes?: boolean
    createdAt?: boolean
    echauffement?: boolean | EchauffementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blocEchauffement"]>

  export type BlocEchauffementSelectScalar = {
    id?: boolean
    echauffementId?: boolean
    ordre?: boolean
    titre?: boolean
    repetitions?: boolean
    temps?: boolean
    informations?: boolean
    fonctionnement?: boolean
    notes?: boolean
    createdAt?: boolean
  }

  export type BlocEchauffementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    echauffement?: boolean | EchauffementDefaultArgs<ExtArgs>
  }
  export type BlocEchauffementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    echauffement?: boolean | EchauffementDefaultArgs<ExtArgs>
  }

  export type $BlocEchauffementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BlocEchauffement"
    objects: {
      echauffement: Prisma.$EchauffementPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      echauffementId: string
      ordre: number
      titre: string
      repetitions: string | null
      temps: string | null
      informations: string | null
      fonctionnement: string | null
      notes: string | null
      createdAt: Date
    }, ExtArgs["result"]["blocEchauffement"]>
    composites: {}
  }

  type BlocEchauffementGetPayload<S extends boolean | null | undefined | BlocEchauffementDefaultArgs> = $Result.GetResult<Prisma.$BlocEchauffementPayload, S>

  type BlocEchauffementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BlocEchauffementFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BlocEchauffementCountAggregateInputType | true
    }

  export interface BlocEchauffementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BlocEchauffement'], meta: { name: 'BlocEchauffement' } }
    /**
     * Find zero or one BlocEchauffement that matches the filter.
     * @param {BlocEchauffementFindUniqueArgs} args - Arguments to find a BlocEchauffement
     * @example
     * // Get one BlocEchauffement
     * const blocEchauffement = await prisma.blocEchauffement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BlocEchauffementFindUniqueArgs>(args: SelectSubset<T, BlocEchauffementFindUniqueArgs<ExtArgs>>): Prisma__BlocEchauffementClient<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one BlocEchauffement that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BlocEchauffementFindUniqueOrThrowArgs} args - Arguments to find a BlocEchauffement
     * @example
     * // Get one BlocEchauffement
     * const blocEchauffement = await prisma.blocEchauffement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BlocEchauffementFindUniqueOrThrowArgs>(args: SelectSubset<T, BlocEchauffementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BlocEchauffementClient<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first BlocEchauffement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlocEchauffementFindFirstArgs} args - Arguments to find a BlocEchauffement
     * @example
     * // Get one BlocEchauffement
     * const blocEchauffement = await prisma.blocEchauffement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BlocEchauffementFindFirstArgs>(args?: SelectSubset<T, BlocEchauffementFindFirstArgs<ExtArgs>>): Prisma__BlocEchauffementClient<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first BlocEchauffement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlocEchauffementFindFirstOrThrowArgs} args - Arguments to find a BlocEchauffement
     * @example
     * // Get one BlocEchauffement
     * const blocEchauffement = await prisma.blocEchauffement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BlocEchauffementFindFirstOrThrowArgs>(args?: SelectSubset<T, BlocEchauffementFindFirstOrThrowArgs<ExtArgs>>): Prisma__BlocEchauffementClient<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more BlocEchauffements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlocEchauffementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BlocEchauffements
     * const blocEchauffements = await prisma.blocEchauffement.findMany()
     * 
     * // Get first 10 BlocEchauffements
     * const blocEchauffements = await prisma.blocEchauffement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const blocEchauffementWithIdOnly = await prisma.blocEchauffement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BlocEchauffementFindManyArgs>(args?: SelectSubset<T, BlocEchauffementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a BlocEchauffement.
     * @param {BlocEchauffementCreateArgs} args - Arguments to create a BlocEchauffement.
     * @example
     * // Create one BlocEchauffement
     * const BlocEchauffement = await prisma.blocEchauffement.create({
     *   data: {
     *     // ... data to create a BlocEchauffement
     *   }
     * })
     * 
     */
    create<T extends BlocEchauffementCreateArgs>(args: SelectSubset<T, BlocEchauffementCreateArgs<ExtArgs>>): Prisma__BlocEchauffementClient<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many BlocEchauffements.
     * @param {BlocEchauffementCreateManyArgs} args - Arguments to create many BlocEchauffements.
     * @example
     * // Create many BlocEchauffements
     * const blocEchauffement = await prisma.blocEchauffement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BlocEchauffementCreateManyArgs>(args?: SelectSubset<T, BlocEchauffementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BlocEchauffements and returns the data saved in the database.
     * @param {BlocEchauffementCreateManyAndReturnArgs} args - Arguments to create many BlocEchauffements.
     * @example
     * // Create many BlocEchauffements
     * const blocEchauffement = await prisma.blocEchauffement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BlocEchauffements and only return the `id`
     * const blocEchauffementWithIdOnly = await prisma.blocEchauffement.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BlocEchauffementCreateManyAndReturnArgs>(args?: SelectSubset<T, BlocEchauffementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a BlocEchauffement.
     * @param {BlocEchauffementDeleteArgs} args - Arguments to delete one BlocEchauffement.
     * @example
     * // Delete one BlocEchauffement
     * const BlocEchauffement = await prisma.blocEchauffement.delete({
     *   where: {
     *     // ... filter to delete one BlocEchauffement
     *   }
     * })
     * 
     */
    delete<T extends BlocEchauffementDeleteArgs>(args: SelectSubset<T, BlocEchauffementDeleteArgs<ExtArgs>>): Prisma__BlocEchauffementClient<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one BlocEchauffement.
     * @param {BlocEchauffementUpdateArgs} args - Arguments to update one BlocEchauffement.
     * @example
     * // Update one BlocEchauffement
     * const blocEchauffement = await prisma.blocEchauffement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BlocEchauffementUpdateArgs>(args: SelectSubset<T, BlocEchauffementUpdateArgs<ExtArgs>>): Prisma__BlocEchauffementClient<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more BlocEchauffements.
     * @param {BlocEchauffementDeleteManyArgs} args - Arguments to filter BlocEchauffements to delete.
     * @example
     * // Delete a few BlocEchauffements
     * const { count } = await prisma.blocEchauffement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BlocEchauffementDeleteManyArgs>(args?: SelectSubset<T, BlocEchauffementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlocEchauffements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlocEchauffementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BlocEchauffements
     * const blocEchauffement = await prisma.blocEchauffement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BlocEchauffementUpdateManyArgs>(args: SelectSubset<T, BlocEchauffementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one BlocEchauffement.
     * @param {BlocEchauffementUpsertArgs} args - Arguments to update or create a BlocEchauffement.
     * @example
     * // Update or create a BlocEchauffement
     * const blocEchauffement = await prisma.blocEchauffement.upsert({
     *   create: {
     *     // ... data to create a BlocEchauffement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BlocEchauffement we want to update
     *   }
     * })
     */
    upsert<T extends BlocEchauffementUpsertArgs>(args: SelectSubset<T, BlocEchauffementUpsertArgs<ExtArgs>>): Prisma__BlocEchauffementClient<$Result.GetResult<Prisma.$BlocEchauffementPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of BlocEchauffements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlocEchauffementCountArgs} args - Arguments to filter BlocEchauffements to count.
     * @example
     * // Count the number of BlocEchauffements
     * const count = await prisma.blocEchauffement.count({
     *   where: {
     *     // ... the filter for the BlocEchauffements we want to count
     *   }
     * })
    **/
    count<T extends BlocEchauffementCountArgs>(
      args?: Subset<T, BlocEchauffementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BlocEchauffementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BlocEchauffement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlocEchauffementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BlocEchauffementAggregateArgs>(args: Subset<T, BlocEchauffementAggregateArgs>): Prisma.PrismaPromise<GetBlocEchauffementAggregateType<T>>

    /**
     * Group by BlocEchauffement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlocEchauffementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BlocEchauffementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BlocEchauffementGroupByArgs['orderBy'] }
        : { orderBy?: BlocEchauffementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BlocEchauffementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBlocEchauffementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BlocEchauffement model
   */
  readonly fields: BlocEchauffementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BlocEchauffement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BlocEchauffementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    echauffement<T extends EchauffementDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EchauffementDefaultArgs<ExtArgs>>): Prisma__EchauffementClient<$Result.GetResult<Prisma.$EchauffementPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BlocEchauffement model
   */ 
  interface BlocEchauffementFieldRefs {
    readonly id: FieldRef<"BlocEchauffement", 'String'>
    readonly echauffementId: FieldRef<"BlocEchauffement", 'String'>
    readonly ordre: FieldRef<"BlocEchauffement", 'Int'>
    readonly titre: FieldRef<"BlocEchauffement", 'String'>
    readonly repetitions: FieldRef<"BlocEchauffement", 'String'>
    readonly temps: FieldRef<"BlocEchauffement", 'String'>
    readonly informations: FieldRef<"BlocEchauffement", 'String'>
    readonly fonctionnement: FieldRef<"BlocEchauffement", 'String'>
    readonly notes: FieldRef<"BlocEchauffement", 'String'>
    readonly createdAt: FieldRef<"BlocEchauffement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BlocEchauffement findUnique
   */
  export type BlocEchauffementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    /**
     * Filter, which BlocEchauffement to fetch.
     */
    where: BlocEchauffementWhereUniqueInput
  }

  /**
   * BlocEchauffement findUniqueOrThrow
   */
  export type BlocEchauffementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    /**
     * Filter, which BlocEchauffement to fetch.
     */
    where: BlocEchauffementWhereUniqueInput
  }

  /**
   * BlocEchauffement findFirst
   */
  export type BlocEchauffementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    /**
     * Filter, which BlocEchauffement to fetch.
     */
    where?: BlocEchauffementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlocEchauffements to fetch.
     */
    orderBy?: BlocEchauffementOrderByWithRelationInput | BlocEchauffementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlocEchauffements.
     */
    cursor?: BlocEchauffementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlocEchauffements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlocEchauffements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlocEchauffements.
     */
    distinct?: BlocEchauffementScalarFieldEnum | BlocEchauffementScalarFieldEnum[]
  }

  /**
   * BlocEchauffement findFirstOrThrow
   */
  export type BlocEchauffementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    /**
     * Filter, which BlocEchauffement to fetch.
     */
    where?: BlocEchauffementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlocEchauffements to fetch.
     */
    orderBy?: BlocEchauffementOrderByWithRelationInput | BlocEchauffementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlocEchauffements.
     */
    cursor?: BlocEchauffementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlocEchauffements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlocEchauffements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlocEchauffements.
     */
    distinct?: BlocEchauffementScalarFieldEnum | BlocEchauffementScalarFieldEnum[]
  }

  /**
   * BlocEchauffement findMany
   */
  export type BlocEchauffementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    /**
     * Filter, which BlocEchauffements to fetch.
     */
    where?: BlocEchauffementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlocEchauffements to fetch.
     */
    orderBy?: BlocEchauffementOrderByWithRelationInput | BlocEchauffementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BlocEchauffements.
     */
    cursor?: BlocEchauffementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlocEchauffements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlocEchauffements.
     */
    skip?: number
    distinct?: BlocEchauffementScalarFieldEnum | BlocEchauffementScalarFieldEnum[]
  }

  /**
   * BlocEchauffement create
   */
  export type BlocEchauffementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    /**
     * The data needed to create a BlocEchauffement.
     */
    data: XOR<BlocEchauffementCreateInput, BlocEchauffementUncheckedCreateInput>
  }

  /**
   * BlocEchauffement createMany
   */
  export type BlocEchauffementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BlocEchauffements.
     */
    data: BlocEchauffementCreateManyInput | BlocEchauffementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BlocEchauffement createManyAndReturn
   */
  export type BlocEchauffementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many BlocEchauffements.
     */
    data: BlocEchauffementCreateManyInput | BlocEchauffementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BlocEchauffement update
   */
  export type BlocEchauffementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    /**
     * The data needed to update a BlocEchauffement.
     */
    data: XOR<BlocEchauffementUpdateInput, BlocEchauffementUncheckedUpdateInput>
    /**
     * Choose, which BlocEchauffement to update.
     */
    where: BlocEchauffementWhereUniqueInput
  }

  /**
   * BlocEchauffement updateMany
   */
  export type BlocEchauffementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BlocEchauffements.
     */
    data: XOR<BlocEchauffementUpdateManyMutationInput, BlocEchauffementUncheckedUpdateManyInput>
    /**
     * Filter which BlocEchauffements to update
     */
    where?: BlocEchauffementWhereInput
  }

  /**
   * BlocEchauffement upsert
   */
  export type BlocEchauffementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    /**
     * The filter to search for the BlocEchauffement to update in case it exists.
     */
    where: BlocEchauffementWhereUniqueInput
    /**
     * In case the BlocEchauffement found by the `where` argument doesn't exist, create a new BlocEchauffement with this data.
     */
    create: XOR<BlocEchauffementCreateInput, BlocEchauffementUncheckedCreateInput>
    /**
     * In case the BlocEchauffement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BlocEchauffementUpdateInput, BlocEchauffementUncheckedUpdateInput>
  }

  /**
   * BlocEchauffement delete
   */
  export type BlocEchauffementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
    /**
     * Filter which BlocEchauffement to delete.
     */
    where: BlocEchauffementWhereUniqueInput
  }

  /**
   * BlocEchauffement deleteMany
   */
  export type BlocEchauffementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlocEchauffements to delete
     */
    where?: BlocEchauffementWhereInput
  }

  /**
   * BlocEchauffement without action
   */
  export type BlocEchauffementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlocEchauffement
     */
    select?: BlocEchauffementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlocEchauffementInclude<ExtArgs> | null
  }


  /**
   * Model SituationMatch
   */

  export type AggregateSituationMatch = {
    _count: SituationMatchCountAggregateOutputType | null
    _min: SituationMatchMinAggregateOutputType | null
    _max: SituationMatchMaxAggregateOutputType | null
  }

  export type SituationMatchMinAggregateOutputType = {
    id: string | null
    nom: string | null
    type: string | null
    description: string | null
    temps: string | null
    imageUrl: string | null
    createdAt: Date | null
  }

  export type SituationMatchMaxAggregateOutputType = {
    id: string | null
    nom: string | null
    type: string | null
    description: string | null
    temps: string | null
    imageUrl: string | null
    createdAt: Date | null
  }

  export type SituationMatchCountAggregateOutputType = {
    id: number
    nom: number
    type: number
    description: number
    temps: number
    imageUrl: number
    createdAt: number
    _all: number
  }


  export type SituationMatchMinAggregateInputType = {
    id?: true
    nom?: true
    type?: true
    description?: true
    temps?: true
    imageUrl?: true
    createdAt?: true
  }

  export type SituationMatchMaxAggregateInputType = {
    id?: true
    nom?: true
    type?: true
    description?: true
    temps?: true
    imageUrl?: true
    createdAt?: true
  }

  export type SituationMatchCountAggregateInputType = {
    id?: true
    nom?: true
    type?: true
    description?: true
    temps?: true
    imageUrl?: true
    createdAt?: true
    _all?: true
  }

  export type SituationMatchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SituationMatch to aggregate.
     */
    where?: SituationMatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SituationMatches to fetch.
     */
    orderBy?: SituationMatchOrderByWithRelationInput | SituationMatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SituationMatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SituationMatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SituationMatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SituationMatches
    **/
    _count?: true | SituationMatchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SituationMatchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SituationMatchMaxAggregateInputType
  }

  export type GetSituationMatchAggregateType<T extends SituationMatchAggregateArgs> = {
        [P in keyof T & keyof AggregateSituationMatch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSituationMatch[P]>
      : GetScalarType<T[P], AggregateSituationMatch[P]>
  }




  export type SituationMatchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SituationMatchWhereInput
    orderBy?: SituationMatchOrderByWithAggregationInput | SituationMatchOrderByWithAggregationInput[]
    by: SituationMatchScalarFieldEnum[] | SituationMatchScalarFieldEnum
    having?: SituationMatchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SituationMatchCountAggregateInputType | true
    _min?: SituationMatchMinAggregateInputType
    _max?: SituationMatchMaxAggregateInputType
  }

  export type SituationMatchGroupByOutputType = {
    id: string
    nom: string | null
    type: string
    description: string | null
    temps: string | null
    imageUrl: string | null
    createdAt: Date
    _count: SituationMatchCountAggregateOutputType | null
    _min: SituationMatchMinAggregateOutputType | null
    _max: SituationMatchMaxAggregateOutputType | null
  }

  type GetSituationMatchGroupByPayload<T extends SituationMatchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SituationMatchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SituationMatchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SituationMatchGroupByOutputType[P]>
            : GetScalarType<T[P], SituationMatchGroupByOutputType[P]>
        }
      >
    >


  export type SituationMatchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nom?: boolean
    type?: boolean
    description?: boolean
    temps?: boolean
    imageUrl?: boolean
    createdAt?: boolean
    tags?: boolean | SituationMatch$tagsArgs<ExtArgs>
    entrainements?: boolean | SituationMatch$entrainementsArgs<ExtArgs>
    _count?: boolean | SituationMatchCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["situationMatch"]>

  export type SituationMatchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nom?: boolean
    type?: boolean
    description?: boolean
    temps?: boolean
    imageUrl?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["situationMatch"]>

  export type SituationMatchSelectScalar = {
    id?: boolean
    nom?: boolean
    type?: boolean
    description?: boolean
    temps?: boolean
    imageUrl?: boolean
    createdAt?: boolean
  }

  export type SituationMatchInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | SituationMatch$tagsArgs<ExtArgs>
    entrainements?: boolean | SituationMatch$entrainementsArgs<ExtArgs>
    _count?: boolean | SituationMatchCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SituationMatchIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SituationMatchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SituationMatch"
    objects: {
      tags: Prisma.$TagPayload<ExtArgs>[]
      entrainements: Prisma.$EntrainementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nom: string | null
      type: string
      description: string | null
      temps: string | null
      imageUrl: string | null
      createdAt: Date
    }, ExtArgs["result"]["situationMatch"]>
    composites: {}
  }

  type SituationMatchGetPayload<S extends boolean | null | undefined | SituationMatchDefaultArgs> = $Result.GetResult<Prisma.$SituationMatchPayload, S>

  type SituationMatchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SituationMatchFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SituationMatchCountAggregateInputType | true
    }

  export interface SituationMatchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SituationMatch'], meta: { name: 'SituationMatch' } }
    /**
     * Find zero or one SituationMatch that matches the filter.
     * @param {SituationMatchFindUniqueArgs} args - Arguments to find a SituationMatch
     * @example
     * // Get one SituationMatch
     * const situationMatch = await prisma.situationMatch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SituationMatchFindUniqueArgs>(args: SelectSubset<T, SituationMatchFindUniqueArgs<ExtArgs>>): Prisma__SituationMatchClient<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SituationMatch that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SituationMatchFindUniqueOrThrowArgs} args - Arguments to find a SituationMatch
     * @example
     * // Get one SituationMatch
     * const situationMatch = await prisma.situationMatch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SituationMatchFindUniqueOrThrowArgs>(args: SelectSubset<T, SituationMatchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SituationMatchClient<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SituationMatch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SituationMatchFindFirstArgs} args - Arguments to find a SituationMatch
     * @example
     * // Get one SituationMatch
     * const situationMatch = await prisma.situationMatch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SituationMatchFindFirstArgs>(args?: SelectSubset<T, SituationMatchFindFirstArgs<ExtArgs>>): Prisma__SituationMatchClient<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SituationMatch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SituationMatchFindFirstOrThrowArgs} args - Arguments to find a SituationMatch
     * @example
     * // Get one SituationMatch
     * const situationMatch = await prisma.situationMatch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SituationMatchFindFirstOrThrowArgs>(args?: SelectSubset<T, SituationMatchFindFirstOrThrowArgs<ExtArgs>>): Prisma__SituationMatchClient<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SituationMatches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SituationMatchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SituationMatches
     * const situationMatches = await prisma.situationMatch.findMany()
     * 
     * // Get first 10 SituationMatches
     * const situationMatches = await prisma.situationMatch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const situationMatchWithIdOnly = await prisma.situationMatch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SituationMatchFindManyArgs>(args?: SelectSubset<T, SituationMatchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SituationMatch.
     * @param {SituationMatchCreateArgs} args - Arguments to create a SituationMatch.
     * @example
     * // Create one SituationMatch
     * const SituationMatch = await prisma.situationMatch.create({
     *   data: {
     *     // ... data to create a SituationMatch
     *   }
     * })
     * 
     */
    create<T extends SituationMatchCreateArgs>(args: SelectSubset<T, SituationMatchCreateArgs<ExtArgs>>): Prisma__SituationMatchClient<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SituationMatches.
     * @param {SituationMatchCreateManyArgs} args - Arguments to create many SituationMatches.
     * @example
     * // Create many SituationMatches
     * const situationMatch = await prisma.situationMatch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SituationMatchCreateManyArgs>(args?: SelectSubset<T, SituationMatchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SituationMatches and returns the data saved in the database.
     * @param {SituationMatchCreateManyAndReturnArgs} args - Arguments to create many SituationMatches.
     * @example
     * // Create many SituationMatches
     * const situationMatch = await prisma.situationMatch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SituationMatches and only return the `id`
     * const situationMatchWithIdOnly = await prisma.situationMatch.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SituationMatchCreateManyAndReturnArgs>(args?: SelectSubset<T, SituationMatchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SituationMatch.
     * @param {SituationMatchDeleteArgs} args - Arguments to delete one SituationMatch.
     * @example
     * // Delete one SituationMatch
     * const SituationMatch = await prisma.situationMatch.delete({
     *   where: {
     *     // ... filter to delete one SituationMatch
     *   }
     * })
     * 
     */
    delete<T extends SituationMatchDeleteArgs>(args: SelectSubset<T, SituationMatchDeleteArgs<ExtArgs>>): Prisma__SituationMatchClient<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SituationMatch.
     * @param {SituationMatchUpdateArgs} args - Arguments to update one SituationMatch.
     * @example
     * // Update one SituationMatch
     * const situationMatch = await prisma.situationMatch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SituationMatchUpdateArgs>(args: SelectSubset<T, SituationMatchUpdateArgs<ExtArgs>>): Prisma__SituationMatchClient<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SituationMatches.
     * @param {SituationMatchDeleteManyArgs} args - Arguments to filter SituationMatches to delete.
     * @example
     * // Delete a few SituationMatches
     * const { count } = await prisma.situationMatch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SituationMatchDeleteManyArgs>(args?: SelectSubset<T, SituationMatchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SituationMatches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SituationMatchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SituationMatches
     * const situationMatch = await prisma.situationMatch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SituationMatchUpdateManyArgs>(args: SelectSubset<T, SituationMatchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SituationMatch.
     * @param {SituationMatchUpsertArgs} args - Arguments to update or create a SituationMatch.
     * @example
     * // Update or create a SituationMatch
     * const situationMatch = await prisma.situationMatch.upsert({
     *   create: {
     *     // ... data to create a SituationMatch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SituationMatch we want to update
     *   }
     * })
     */
    upsert<T extends SituationMatchUpsertArgs>(args: SelectSubset<T, SituationMatchUpsertArgs<ExtArgs>>): Prisma__SituationMatchClient<$Result.GetResult<Prisma.$SituationMatchPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SituationMatches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SituationMatchCountArgs} args - Arguments to filter SituationMatches to count.
     * @example
     * // Count the number of SituationMatches
     * const count = await prisma.situationMatch.count({
     *   where: {
     *     // ... the filter for the SituationMatches we want to count
     *   }
     * })
    **/
    count<T extends SituationMatchCountArgs>(
      args?: Subset<T, SituationMatchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SituationMatchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SituationMatch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SituationMatchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SituationMatchAggregateArgs>(args: Subset<T, SituationMatchAggregateArgs>): Prisma.PrismaPromise<GetSituationMatchAggregateType<T>>

    /**
     * Group by SituationMatch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SituationMatchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SituationMatchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SituationMatchGroupByArgs['orderBy'] }
        : { orderBy?: SituationMatchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SituationMatchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSituationMatchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SituationMatch model
   */
  readonly fields: SituationMatchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SituationMatch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SituationMatchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tags<T extends SituationMatch$tagsArgs<ExtArgs> = {}>(args?: Subset<T, SituationMatch$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany"> | Null>
    entrainements<T extends SituationMatch$entrainementsArgs<ExtArgs> = {}>(args?: Subset<T, SituationMatch$entrainementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EntrainementPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SituationMatch model
   */ 
  interface SituationMatchFieldRefs {
    readonly id: FieldRef<"SituationMatch", 'String'>
    readonly nom: FieldRef<"SituationMatch", 'String'>
    readonly type: FieldRef<"SituationMatch", 'String'>
    readonly description: FieldRef<"SituationMatch", 'String'>
    readonly temps: FieldRef<"SituationMatch", 'String'>
    readonly imageUrl: FieldRef<"SituationMatch", 'String'>
    readonly createdAt: FieldRef<"SituationMatch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SituationMatch findUnique
   */
  export type SituationMatchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    /**
     * Filter, which SituationMatch to fetch.
     */
    where: SituationMatchWhereUniqueInput
  }

  /**
   * SituationMatch findUniqueOrThrow
   */
  export type SituationMatchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    /**
     * Filter, which SituationMatch to fetch.
     */
    where: SituationMatchWhereUniqueInput
  }

  /**
   * SituationMatch findFirst
   */
  export type SituationMatchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    /**
     * Filter, which SituationMatch to fetch.
     */
    where?: SituationMatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SituationMatches to fetch.
     */
    orderBy?: SituationMatchOrderByWithRelationInput | SituationMatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SituationMatches.
     */
    cursor?: SituationMatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SituationMatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SituationMatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SituationMatches.
     */
    distinct?: SituationMatchScalarFieldEnum | SituationMatchScalarFieldEnum[]
  }

  /**
   * SituationMatch findFirstOrThrow
   */
  export type SituationMatchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    /**
     * Filter, which SituationMatch to fetch.
     */
    where?: SituationMatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SituationMatches to fetch.
     */
    orderBy?: SituationMatchOrderByWithRelationInput | SituationMatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SituationMatches.
     */
    cursor?: SituationMatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SituationMatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SituationMatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SituationMatches.
     */
    distinct?: SituationMatchScalarFieldEnum | SituationMatchScalarFieldEnum[]
  }

  /**
   * SituationMatch findMany
   */
  export type SituationMatchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    /**
     * Filter, which SituationMatches to fetch.
     */
    where?: SituationMatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SituationMatches to fetch.
     */
    orderBy?: SituationMatchOrderByWithRelationInput | SituationMatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SituationMatches.
     */
    cursor?: SituationMatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SituationMatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SituationMatches.
     */
    skip?: number
    distinct?: SituationMatchScalarFieldEnum | SituationMatchScalarFieldEnum[]
  }

  /**
   * SituationMatch create
   */
  export type SituationMatchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    /**
     * The data needed to create a SituationMatch.
     */
    data: XOR<SituationMatchCreateInput, SituationMatchUncheckedCreateInput>
  }

  /**
   * SituationMatch createMany
   */
  export type SituationMatchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SituationMatches.
     */
    data: SituationMatchCreateManyInput | SituationMatchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SituationMatch createManyAndReturn
   */
  export type SituationMatchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SituationMatches.
     */
    data: SituationMatchCreateManyInput | SituationMatchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SituationMatch update
   */
  export type SituationMatchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    /**
     * The data needed to update a SituationMatch.
     */
    data: XOR<SituationMatchUpdateInput, SituationMatchUncheckedUpdateInput>
    /**
     * Choose, which SituationMatch to update.
     */
    where: SituationMatchWhereUniqueInput
  }

  /**
   * SituationMatch updateMany
   */
  export type SituationMatchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SituationMatches.
     */
    data: XOR<SituationMatchUpdateManyMutationInput, SituationMatchUncheckedUpdateManyInput>
    /**
     * Filter which SituationMatches to update
     */
    where?: SituationMatchWhereInput
  }

  /**
   * SituationMatch upsert
   */
  export type SituationMatchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    /**
     * The filter to search for the SituationMatch to update in case it exists.
     */
    where: SituationMatchWhereUniqueInput
    /**
     * In case the SituationMatch found by the `where` argument doesn't exist, create a new SituationMatch with this data.
     */
    create: XOR<SituationMatchCreateInput, SituationMatchUncheckedCreateInput>
    /**
     * In case the SituationMatch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SituationMatchUpdateInput, SituationMatchUncheckedUpdateInput>
  }

  /**
   * SituationMatch delete
   */
  export type SituationMatchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
    /**
     * Filter which SituationMatch to delete.
     */
    where: SituationMatchWhereUniqueInput
  }

  /**
   * SituationMatch deleteMany
   */
  export type SituationMatchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SituationMatches to delete
     */
    where?: SituationMatchWhereInput
  }

  /**
   * SituationMatch.tags
   */
  export type SituationMatch$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    where?: TagWhereInput
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    cursor?: TagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * SituationMatch.entrainements
   */
  export type SituationMatch$entrainementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Entrainement
     */
    select?: EntrainementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EntrainementInclude<ExtArgs> | null
    where?: EntrainementWhereInput
    orderBy?: EntrainementOrderByWithRelationInput | EntrainementOrderByWithRelationInput[]
    cursor?: EntrainementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EntrainementScalarFieldEnum | EntrainementScalarFieldEnum[]
  }

  /**
   * SituationMatch without action
   */
  export type SituationMatchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SituationMatch
     */
    select?: SituationMatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SituationMatchInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    nom: string | null
    prenom: string | null
    role: string | null
    isActive: boolean | null
    iconUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
    securityQuestion: string | null
    securityAnswer: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    nom: string | null
    prenom: string | null
    role: string | null
    isActive: boolean | null
    iconUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
    securityQuestion: string | null
    securityAnswer: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    nom: number
    prenom: number
    role: number
    isActive: number
    iconUrl: number
    createdAt: number
    updatedAt: number
    securityQuestion: number
    securityAnswer: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    nom?: true
    prenom?: true
    role?: true
    isActive?: true
    iconUrl?: true
    createdAt?: true
    updatedAt?: true
    securityQuestion?: true
    securityAnswer?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    nom?: true
    prenom?: true
    role?: true
    isActive?: true
    iconUrl?: true
    createdAt?: true
    updatedAt?: true
    securityQuestion?: true
    securityAnswer?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    nom?: true
    prenom?: true
    role?: true
    isActive?: true
    iconUrl?: true
    createdAt?: true
    updatedAt?: true
    securityQuestion?: true
    securityAnswer?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    password: string | null
    nom: string
    prenom: string | null
    role: string
    isActive: boolean
    iconUrl: string | null
    createdAt: Date
    updatedAt: Date
    securityQuestion: string | null
    securityAnswer: string | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    nom?: boolean
    prenom?: boolean
    role?: boolean
    isActive?: boolean
    iconUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    securityQuestion?: boolean
    securityAnswer?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    nom?: boolean
    prenom?: boolean
    role?: boolean
    isActive?: boolean
    iconUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    securityQuestion?: boolean
    securityAnswer?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    nom?: boolean
    prenom?: boolean
    role?: boolean
    isActive?: boolean
    iconUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    securityQuestion?: boolean
    securityAnswer?: boolean
  }


  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string | null
      nom: string
      prenom: string | null
      role: string
      isActive: boolean
      iconUrl: string | null
      createdAt: Date
      updatedAt: Date
      securityQuestion: string | null
      securityAnswer: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly nom: FieldRef<"User", 'String'>
    readonly prenom: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly iconUrl: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly securityQuestion: FieldRef<"User", 'String'>
    readonly securityAnswer: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ExerciceScalarFieldEnum: {
    id: 'id',
    nom: 'nom',
    description: 'description',
    imageUrl: 'imageUrl',
    schemaUrl: 'schemaUrl',
    materiel: 'materiel',
    notes: 'notes',
    variablesText: 'variablesText',
    variablesPlus: 'variablesPlus',
    variablesMinus: 'variablesMinus',
    createdAt: 'createdAt'
  };

  export type ExerciceScalarFieldEnum = (typeof ExerciceScalarFieldEnum)[keyof typeof ExerciceScalarFieldEnum]


  export const TagScalarFieldEnum: {
    id: 'id',
    label: 'label',
    category: 'category',
    color: 'color',
    level: 'level',
    createdAt: 'createdAt'
  };

  export type TagScalarFieldEnum = (typeof TagScalarFieldEnum)[keyof typeof TagScalarFieldEnum]


  export const EntrainementScalarFieldEnum: {
    id: 'id',
    titre: 'titre',
    date: 'date',
    imageUrl: 'imageUrl',
    createdAt: 'createdAt',
    echauffementId: 'echauffementId',
    situationMatchId: 'situationMatchId'
  };

  export type EntrainementScalarFieldEnum = (typeof EntrainementScalarFieldEnum)[keyof typeof EntrainementScalarFieldEnum]


  export const EntrainementExerciceScalarFieldEnum: {
    id: 'id',
    entrainementId: 'entrainementId',
    exerciceId: 'exerciceId',
    ordre: 'ordre',
    duree: 'duree',
    notes: 'notes',
    createdAt: 'createdAt'
  };

  export type EntrainementExerciceScalarFieldEnum = (typeof EntrainementExerciceScalarFieldEnum)[keyof typeof EntrainementExerciceScalarFieldEnum]


  export const EchauffementScalarFieldEnum: {
    id: 'id',
    nom: 'nom',
    description: 'description',
    imageUrl: 'imageUrl',
    createdAt: 'createdAt'
  };

  export type EchauffementScalarFieldEnum = (typeof EchauffementScalarFieldEnum)[keyof typeof EchauffementScalarFieldEnum]


  export const BlocEchauffementScalarFieldEnum: {
    id: 'id',
    echauffementId: 'echauffementId',
    ordre: 'ordre',
    titre: 'titre',
    repetitions: 'repetitions',
    temps: 'temps',
    informations: 'informations',
    fonctionnement: 'fonctionnement',
    notes: 'notes',
    createdAt: 'createdAt'
  };

  export type BlocEchauffementScalarFieldEnum = (typeof BlocEchauffementScalarFieldEnum)[keyof typeof BlocEchauffementScalarFieldEnum]


  export const SituationMatchScalarFieldEnum: {
    id: 'id',
    nom: 'nom',
    type: 'type',
    description: 'description',
    temps: 'temps',
    imageUrl: 'imageUrl',
    createdAt: 'createdAt'
  };

  export type SituationMatchScalarFieldEnum = (typeof SituationMatchScalarFieldEnum)[keyof typeof SituationMatchScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    nom: 'nom',
    prenom: 'prenom',
    role: 'role',
    isActive: 'isActive',
    iconUrl: 'iconUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    securityQuestion: 'securityQuestion',
    securityAnswer: 'securityAnswer'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ExerciceWhereInput = {
    AND?: ExerciceWhereInput | ExerciceWhereInput[]
    OR?: ExerciceWhereInput[]
    NOT?: ExerciceWhereInput | ExerciceWhereInput[]
    id?: StringFilter<"Exercice"> | string
    nom?: StringFilter<"Exercice"> | string
    description?: StringFilter<"Exercice"> | string
    imageUrl?: StringNullableFilter<"Exercice"> | string | null
    schemaUrl?: StringNullableFilter<"Exercice"> | string | null
    materiel?: StringNullableFilter<"Exercice"> | string | null
    notes?: StringNullableFilter<"Exercice"> | string | null
    variablesText?: StringNullableFilter<"Exercice"> | string | null
    variablesPlus?: StringNullableFilter<"Exercice"> | string | null
    variablesMinus?: StringNullableFilter<"Exercice"> | string | null
    createdAt?: DateTimeFilter<"Exercice"> | Date | string
    tags?: TagListRelationFilter
    entrainements?: EntrainementExerciceListRelationFilter
  }

  export type ExerciceOrderByWithRelationInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    schemaUrl?: SortOrderInput | SortOrder
    materiel?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    variablesText?: SortOrderInput | SortOrder
    variablesPlus?: SortOrderInput | SortOrder
    variablesMinus?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    tags?: TagOrderByRelationAggregateInput
    entrainements?: EntrainementExerciceOrderByRelationAggregateInput
  }

  export type ExerciceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExerciceWhereInput | ExerciceWhereInput[]
    OR?: ExerciceWhereInput[]
    NOT?: ExerciceWhereInput | ExerciceWhereInput[]
    nom?: StringFilter<"Exercice"> | string
    description?: StringFilter<"Exercice"> | string
    imageUrl?: StringNullableFilter<"Exercice"> | string | null
    schemaUrl?: StringNullableFilter<"Exercice"> | string | null
    materiel?: StringNullableFilter<"Exercice"> | string | null
    notes?: StringNullableFilter<"Exercice"> | string | null
    variablesText?: StringNullableFilter<"Exercice"> | string | null
    variablesPlus?: StringNullableFilter<"Exercice"> | string | null
    variablesMinus?: StringNullableFilter<"Exercice"> | string | null
    createdAt?: DateTimeFilter<"Exercice"> | Date | string
    tags?: TagListRelationFilter
    entrainements?: EntrainementExerciceListRelationFilter
  }, "id">

  export type ExerciceOrderByWithAggregationInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    schemaUrl?: SortOrderInput | SortOrder
    materiel?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    variablesText?: SortOrderInput | SortOrder
    variablesPlus?: SortOrderInput | SortOrder
    variablesMinus?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ExerciceCountOrderByAggregateInput
    _max?: ExerciceMaxOrderByAggregateInput
    _min?: ExerciceMinOrderByAggregateInput
  }

  export type ExerciceScalarWhereWithAggregatesInput = {
    AND?: ExerciceScalarWhereWithAggregatesInput | ExerciceScalarWhereWithAggregatesInput[]
    OR?: ExerciceScalarWhereWithAggregatesInput[]
    NOT?: ExerciceScalarWhereWithAggregatesInput | ExerciceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Exercice"> | string
    nom?: StringWithAggregatesFilter<"Exercice"> | string
    description?: StringWithAggregatesFilter<"Exercice"> | string
    imageUrl?: StringNullableWithAggregatesFilter<"Exercice"> | string | null
    schemaUrl?: StringNullableWithAggregatesFilter<"Exercice"> | string | null
    materiel?: StringNullableWithAggregatesFilter<"Exercice"> | string | null
    notes?: StringNullableWithAggregatesFilter<"Exercice"> | string | null
    variablesText?: StringNullableWithAggregatesFilter<"Exercice"> | string | null
    variablesPlus?: StringNullableWithAggregatesFilter<"Exercice"> | string | null
    variablesMinus?: StringNullableWithAggregatesFilter<"Exercice"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Exercice"> | Date | string
  }

  export type TagWhereInput = {
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    id?: StringFilter<"Tag"> | string
    label?: StringFilter<"Tag"> | string
    category?: StringFilter<"Tag"> | string
    color?: StringNullableFilter<"Tag"> | string | null
    level?: IntNullableFilter<"Tag"> | number | null
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    exercices?: ExerciceListRelationFilter
    entrainements?: EntrainementListRelationFilter
    situationsMatchs?: SituationMatchListRelationFilter
  }

  export type TagOrderByWithRelationInput = {
    id?: SortOrder
    label?: SortOrder
    category?: SortOrder
    color?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    exercices?: ExerciceOrderByRelationAggregateInput
    entrainements?: EntrainementOrderByRelationAggregateInput
    situationsMatchs?: SituationMatchOrderByRelationAggregateInput
  }

  export type TagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    label_category?: TagLabelCategoryCompoundUniqueInput
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    label?: StringFilter<"Tag"> | string
    category?: StringFilter<"Tag"> | string
    color?: StringNullableFilter<"Tag"> | string | null
    level?: IntNullableFilter<"Tag"> | number | null
    createdAt?: DateTimeFilter<"Tag"> | Date | string
    exercices?: ExerciceListRelationFilter
    entrainements?: EntrainementListRelationFilter
    situationsMatchs?: SituationMatchListRelationFilter
  }, "id" | "label_category">

  export type TagOrderByWithAggregationInput = {
    id?: SortOrder
    label?: SortOrder
    category?: SortOrder
    color?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: TagCountOrderByAggregateInput
    _avg?: TagAvgOrderByAggregateInput
    _max?: TagMaxOrderByAggregateInput
    _min?: TagMinOrderByAggregateInput
    _sum?: TagSumOrderByAggregateInput
  }

  export type TagScalarWhereWithAggregatesInput = {
    AND?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    OR?: TagScalarWhereWithAggregatesInput[]
    NOT?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tag"> | string
    label?: StringWithAggregatesFilter<"Tag"> | string
    category?: StringWithAggregatesFilter<"Tag"> | string
    color?: StringNullableWithAggregatesFilter<"Tag"> | string | null
    level?: IntNullableWithAggregatesFilter<"Tag"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Tag"> | Date | string
  }

  export type EntrainementWhereInput = {
    AND?: EntrainementWhereInput | EntrainementWhereInput[]
    OR?: EntrainementWhereInput[]
    NOT?: EntrainementWhereInput | EntrainementWhereInput[]
    id?: StringFilter<"Entrainement"> | string
    titre?: StringFilter<"Entrainement"> | string
    date?: DateTimeNullableFilter<"Entrainement"> | Date | string | null
    imageUrl?: StringNullableFilter<"Entrainement"> | string | null
    createdAt?: DateTimeFilter<"Entrainement"> | Date | string
    echauffementId?: StringNullableFilter<"Entrainement"> | string | null
    situationMatchId?: StringNullableFilter<"Entrainement"> | string | null
    exercices?: EntrainementExerciceListRelationFilter
    tags?: TagListRelationFilter
    echauffement?: XOR<EchauffementNullableRelationFilter, EchauffementWhereInput> | null
    situationMatch?: XOR<SituationMatchNullableRelationFilter, SituationMatchWhereInput> | null
  }

  export type EntrainementOrderByWithRelationInput = {
    id?: SortOrder
    titre?: SortOrder
    date?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    echauffementId?: SortOrderInput | SortOrder
    situationMatchId?: SortOrderInput | SortOrder
    exercices?: EntrainementExerciceOrderByRelationAggregateInput
    tags?: TagOrderByRelationAggregateInput
    echauffement?: EchauffementOrderByWithRelationInput
    situationMatch?: SituationMatchOrderByWithRelationInput
  }

  export type EntrainementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EntrainementWhereInput | EntrainementWhereInput[]
    OR?: EntrainementWhereInput[]
    NOT?: EntrainementWhereInput | EntrainementWhereInput[]
    titre?: StringFilter<"Entrainement"> | string
    date?: DateTimeNullableFilter<"Entrainement"> | Date | string | null
    imageUrl?: StringNullableFilter<"Entrainement"> | string | null
    createdAt?: DateTimeFilter<"Entrainement"> | Date | string
    echauffementId?: StringNullableFilter<"Entrainement"> | string | null
    situationMatchId?: StringNullableFilter<"Entrainement"> | string | null
    exercices?: EntrainementExerciceListRelationFilter
    tags?: TagListRelationFilter
    echauffement?: XOR<EchauffementNullableRelationFilter, EchauffementWhereInput> | null
    situationMatch?: XOR<SituationMatchNullableRelationFilter, SituationMatchWhereInput> | null
  }, "id">

  export type EntrainementOrderByWithAggregationInput = {
    id?: SortOrder
    titre?: SortOrder
    date?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    echauffementId?: SortOrderInput | SortOrder
    situationMatchId?: SortOrderInput | SortOrder
    _count?: EntrainementCountOrderByAggregateInput
    _max?: EntrainementMaxOrderByAggregateInput
    _min?: EntrainementMinOrderByAggregateInput
  }

  export type EntrainementScalarWhereWithAggregatesInput = {
    AND?: EntrainementScalarWhereWithAggregatesInput | EntrainementScalarWhereWithAggregatesInput[]
    OR?: EntrainementScalarWhereWithAggregatesInput[]
    NOT?: EntrainementScalarWhereWithAggregatesInput | EntrainementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Entrainement"> | string
    titre?: StringWithAggregatesFilter<"Entrainement"> | string
    date?: DateTimeNullableWithAggregatesFilter<"Entrainement"> | Date | string | null
    imageUrl?: StringNullableWithAggregatesFilter<"Entrainement"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Entrainement"> | Date | string
    echauffementId?: StringNullableWithAggregatesFilter<"Entrainement"> | string | null
    situationMatchId?: StringNullableWithAggregatesFilter<"Entrainement"> | string | null
  }

  export type EntrainementExerciceWhereInput = {
    AND?: EntrainementExerciceWhereInput | EntrainementExerciceWhereInput[]
    OR?: EntrainementExerciceWhereInput[]
    NOT?: EntrainementExerciceWhereInput | EntrainementExerciceWhereInput[]
    id?: StringFilter<"EntrainementExercice"> | string
    entrainementId?: StringFilter<"EntrainementExercice"> | string
    exerciceId?: StringFilter<"EntrainementExercice"> | string
    ordre?: IntFilter<"EntrainementExercice"> | number
    duree?: IntNullableFilter<"EntrainementExercice"> | number | null
    notes?: StringNullableFilter<"EntrainementExercice"> | string | null
    createdAt?: DateTimeFilter<"EntrainementExercice"> | Date | string
    entrainement?: XOR<EntrainementRelationFilter, EntrainementWhereInput>
    exercice?: XOR<ExerciceRelationFilter, ExerciceWhereInput>
  }

  export type EntrainementExerciceOrderByWithRelationInput = {
    id?: SortOrder
    entrainementId?: SortOrder
    exerciceId?: SortOrder
    ordre?: SortOrder
    duree?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    entrainement?: EntrainementOrderByWithRelationInput
    exercice?: ExerciceOrderByWithRelationInput
  }

  export type EntrainementExerciceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    entrainementId_exerciceId?: EntrainementExerciceEntrainementIdExerciceIdCompoundUniqueInput
    AND?: EntrainementExerciceWhereInput | EntrainementExerciceWhereInput[]
    OR?: EntrainementExerciceWhereInput[]
    NOT?: EntrainementExerciceWhereInput | EntrainementExerciceWhereInput[]
    entrainementId?: StringFilter<"EntrainementExercice"> | string
    exerciceId?: StringFilter<"EntrainementExercice"> | string
    ordre?: IntFilter<"EntrainementExercice"> | number
    duree?: IntNullableFilter<"EntrainementExercice"> | number | null
    notes?: StringNullableFilter<"EntrainementExercice"> | string | null
    createdAt?: DateTimeFilter<"EntrainementExercice"> | Date | string
    entrainement?: XOR<EntrainementRelationFilter, EntrainementWhereInput>
    exercice?: XOR<ExerciceRelationFilter, ExerciceWhereInput>
  }, "id" | "entrainementId_exerciceId">

  export type EntrainementExerciceOrderByWithAggregationInput = {
    id?: SortOrder
    entrainementId?: SortOrder
    exerciceId?: SortOrder
    ordre?: SortOrder
    duree?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: EntrainementExerciceCountOrderByAggregateInput
    _avg?: EntrainementExerciceAvgOrderByAggregateInput
    _max?: EntrainementExerciceMaxOrderByAggregateInput
    _min?: EntrainementExerciceMinOrderByAggregateInput
    _sum?: EntrainementExerciceSumOrderByAggregateInput
  }

  export type EntrainementExerciceScalarWhereWithAggregatesInput = {
    AND?: EntrainementExerciceScalarWhereWithAggregatesInput | EntrainementExerciceScalarWhereWithAggregatesInput[]
    OR?: EntrainementExerciceScalarWhereWithAggregatesInput[]
    NOT?: EntrainementExerciceScalarWhereWithAggregatesInput | EntrainementExerciceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EntrainementExercice"> | string
    entrainementId?: StringWithAggregatesFilter<"EntrainementExercice"> | string
    exerciceId?: StringWithAggregatesFilter<"EntrainementExercice"> | string
    ordre?: IntWithAggregatesFilter<"EntrainementExercice"> | number
    duree?: IntNullableWithAggregatesFilter<"EntrainementExercice"> | number | null
    notes?: StringNullableWithAggregatesFilter<"EntrainementExercice"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"EntrainementExercice"> | Date | string
  }

  export type EchauffementWhereInput = {
    AND?: EchauffementWhereInput | EchauffementWhereInput[]
    OR?: EchauffementWhereInput[]
    NOT?: EchauffementWhereInput | EchauffementWhereInput[]
    id?: StringFilter<"Echauffement"> | string
    nom?: StringFilter<"Echauffement"> | string
    description?: StringNullableFilter<"Echauffement"> | string | null
    imageUrl?: StringNullableFilter<"Echauffement"> | string | null
    createdAt?: DateTimeFilter<"Echauffement"> | Date | string
    blocs?: BlocEchauffementListRelationFilter
    entrainements?: EntrainementListRelationFilter
  }

  export type EchauffementOrderByWithRelationInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    blocs?: BlocEchauffementOrderByRelationAggregateInput
    entrainements?: EntrainementOrderByRelationAggregateInput
  }

  export type EchauffementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EchauffementWhereInput | EchauffementWhereInput[]
    OR?: EchauffementWhereInput[]
    NOT?: EchauffementWhereInput | EchauffementWhereInput[]
    nom?: StringFilter<"Echauffement"> | string
    description?: StringNullableFilter<"Echauffement"> | string | null
    imageUrl?: StringNullableFilter<"Echauffement"> | string | null
    createdAt?: DateTimeFilter<"Echauffement"> | Date | string
    blocs?: BlocEchauffementListRelationFilter
    entrainements?: EntrainementListRelationFilter
  }, "id">

  export type EchauffementOrderByWithAggregationInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: EchauffementCountOrderByAggregateInput
    _max?: EchauffementMaxOrderByAggregateInput
    _min?: EchauffementMinOrderByAggregateInput
  }

  export type EchauffementScalarWhereWithAggregatesInput = {
    AND?: EchauffementScalarWhereWithAggregatesInput | EchauffementScalarWhereWithAggregatesInput[]
    OR?: EchauffementScalarWhereWithAggregatesInput[]
    NOT?: EchauffementScalarWhereWithAggregatesInput | EchauffementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Echauffement"> | string
    nom?: StringWithAggregatesFilter<"Echauffement"> | string
    description?: StringNullableWithAggregatesFilter<"Echauffement"> | string | null
    imageUrl?: StringNullableWithAggregatesFilter<"Echauffement"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Echauffement"> | Date | string
  }

  export type BlocEchauffementWhereInput = {
    AND?: BlocEchauffementWhereInput | BlocEchauffementWhereInput[]
    OR?: BlocEchauffementWhereInput[]
    NOT?: BlocEchauffementWhereInput | BlocEchauffementWhereInput[]
    id?: StringFilter<"BlocEchauffement"> | string
    echauffementId?: StringFilter<"BlocEchauffement"> | string
    ordre?: IntFilter<"BlocEchauffement"> | number
    titre?: StringFilter<"BlocEchauffement"> | string
    repetitions?: StringNullableFilter<"BlocEchauffement"> | string | null
    temps?: StringNullableFilter<"BlocEchauffement"> | string | null
    informations?: StringNullableFilter<"BlocEchauffement"> | string | null
    fonctionnement?: StringNullableFilter<"BlocEchauffement"> | string | null
    notes?: StringNullableFilter<"BlocEchauffement"> | string | null
    createdAt?: DateTimeFilter<"BlocEchauffement"> | Date | string
    echauffement?: XOR<EchauffementRelationFilter, EchauffementWhereInput>
  }

  export type BlocEchauffementOrderByWithRelationInput = {
    id?: SortOrder
    echauffementId?: SortOrder
    ordre?: SortOrder
    titre?: SortOrder
    repetitions?: SortOrderInput | SortOrder
    temps?: SortOrderInput | SortOrder
    informations?: SortOrderInput | SortOrder
    fonctionnement?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    echauffement?: EchauffementOrderByWithRelationInput
  }

  export type BlocEchauffementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    echauffementId_ordre?: BlocEchauffementEchauffementIdOrdreCompoundUniqueInput
    AND?: BlocEchauffementWhereInput | BlocEchauffementWhereInput[]
    OR?: BlocEchauffementWhereInput[]
    NOT?: BlocEchauffementWhereInput | BlocEchauffementWhereInput[]
    echauffementId?: StringFilter<"BlocEchauffement"> | string
    ordre?: IntFilter<"BlocEchauffement"> | number
    titre?: StringFilter<"BlocEchauffement"> | string
    repetitions?: StringNullableFilter<"BlocEchauffement"> | string | null
    temps?: StringNullableFilter<"BlocEchauffement"> | string | null
    informations?: StringNullableFilter<"BlocEchauffement"> | string | null
    fonctionnement?: StringNullableFilter<"BlocEchauffement"> | string | null
    notes?: StringNullableFilter<"BlocEchauffement"> | string | null
    createdAt?: DateTimeFilter<"BlocEchauffement"> | Date | string
    echauffement?: XOR<EchauffementRelationFilter, EchauffementWhereInput>
  }, "id" | "echauffementId_ordre">

  export type BlocEchauffementOrderByWithAggregationInput = {
    id?: SortOrder
    echauffementId?: SortOrder
    ordre?: SortOrder
    titre?: SortOrder
    repetitions?: SortOrderInput | SortOrder
    temps?: SortOrderInput | SortOrder
    informations?: SortOrderInput | SortOrder
    fonctionnement?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: BlocEchauffementCountOrderByAggregateInput
    _avg?: BlocEchauffementAvgOrderByAggregateInput
    _max?: BlocEchauffementMaxOrderByAggregateInput
    _min?: BlocEchauffementMinOrderByAggregateInput
    _sum?: BlocEchauffementSumOrderByAggregateInput
  }

  export type BlocEchauffementScalarWhereWithAggregatesInput = {
    AND?: BlocEchauffementScalarWhereWithAggregatesInput | BlocEchauffementScalarWhereWithAggregatesInput[]
    OR?: BlocEchauffementScalarWhereWithAggregatesInput[]
    NOT?: BlocEchauffementScalarWhereWithAggregatesInput | BlocEchauffementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BlocEchauffement"> | string
    echauffementId?: StringWithAggregatesFilter<"BlocEchauffement"> | string
    ordre?: IntWithAggregatesFilter<"BlocEchauffement"> | number
    titre?: StringWithAggregatesFilter<"BlocEchauffement"> | string
    repetitions?: StringNullableWithAggregatesFilter<"BlocEchauffement"> | string | null
    temps?: StringNullableWithAggregatesFilter<"BlocEchauffement"> | string | null
    informations?: StringNullableWithAggregatesFilter<"BlocEchauffement"> | string | null
    fonctionnement?: StringNullableWithAggregatesFilter<"BlocEchauffement"> | string | null
    notes?: StringNullableWithAggregatesFilter<"BlocEchauffement"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"BlocEchauffement"> | Date | string
  }

  export type SituationMatchWhereInput = {
    AND?: SituationMatchWhereInput | SituationMatchWhereInput[]
    OR?: SituationMatchWhereInput[]
    NOT?: SituationMatchWhereInput | SituationMatchWhereInput[]
    id?: StringFilter<"SituationMatch"> | string
    nom?: StringNullableFilter<"SituationMatch"> | string | null
    type?: StringFilter<"SituationMatch"> | string
    description?: StringNullableFilter<"SituationMatch"> | string | null
    temps?: StringNullableFilter<"SituationMatch"> | string | null
    imageUrl?: StringNullableFilter<"SituationMatch"> | string | null
    createdAt?: DateTimeFilter<"SituationMatch"> | Date | string
    tags?: TagListRelationFilter
    entrainements?: EntrainementListRelationFilter
  }

  export type SituationMatchOrderByWithRelationInput = {
    id?: SortOrder
    nom?: SortOrderInput | SortOrder
    type?: SortOrder
    description?: SortOrderInput | SortOrder
    temps?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    tags?: TagOrderByRelationAggregateInput
    entrainements?: EntrainementOrderByRelationAggregateInput
  }

  export type SituationMatchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SituationMatchWhereInput | SituationMatchWhereInput[]
    OR?: SituationMatchWhereInput[]
    NOT?: SituationMatchWhereInput | SituationMatchWhereInput[]
    nom?: StringNullableFilter<"SituationMatch"> | string | null
    type?: StringFilter<"SituationMatch"> | string
    description?: StringNullableFilter<"SituationMatch"> | string | null
    temps?: StringNullableFilter<"SituationMatch"> | string | null
    imageUrl?: StringNullableFilter<"SituationMatch"> | string | null
    createdAt?: DateTimeFilter<"SituationMatch"> | Date | string
    tags?: TagListRelationFilter
    entrainements?: EntrainementListRelationFilter
  }, "id">

  export type SituationMatchOrderByWithAggregationInput = {
    id?: SortOrder
    nom?: SortOrderInput | SortOrder
    type?: SortOrder
    description?: SortOrderInput | SortOrder
    temps?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: SituationMatchCountOrderByAggregateInput
    _max?: SituationMatchMaxOrderByAggregateInput
    _min?: SituationMatchMinOrderByAggregateInput
  }

  export type SituationMatchScalarWhereWithAggregatesInput = {
    AND?: SituationMatchScalarWhereWithAggregatesInput | SituationMatchScalarWhereWithAggregatesInput[]
    OR?: SituationMatchScalarWhereWithAggregatesInput[]
    NOT?: SituationMatchScalarWhereWithAggregatesInput | SituationMatchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SituationMatch"> | string
    nom?: StringNullableWithAggregatesFilter<"SituationMatch"> | string | null
    type?: StringWithAggregatesFilter<"SituationMatch"> | string
    description?: StringNullableWithAggregatesFilter<"SituationMatch"> | string | null
    temps?: StringNullableWithAggregatesFilter<"SituationMatch"> | string | null
    imageUrl?: StringNullableWithAggregatesFilter<"SituationMatch"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SituationMatch"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringNullableFilter<"User"> | string | null
    nom?: StringFilter<"User"> | string
    prenom?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    iconUrl?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    securityQuestion?: StringNullableFilter<"User"> | string | null
    securityAnswer?: StringNullableFilter<"User"> | string | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrderInput | SortOrder
    nom?: SortOrder
    prenom?: SortOrderInput | SortOrder
    role?: SortOrder
    isActive?: SortOrder
    iconUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    securityQuestion?: SortOrderInput | SortOrder
    securityAnswer?: SortOrderInput | SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringNullableFilter<"User"> | string | null
    nom?: StringFilter<"User"> | string
    prenom?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    iconUrl?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    securityQuestion?: StringNullableFilter<"User"> | string | null
    securityAnswer?: StringNullableFilter<"User"> | string | null
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrderInput | SortOrder
    nom?: SortOrder
    prenom?: SortOrderInput | SortOrder
    role?: SortOrder
    isActive?: SortOrder
    iconUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    securityQuestion?: SortOrderInput | SortOrder
    securityAnswer?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringNullableWithAggregatesFilter<"User"> | string | null
    nom?: StringWithAggregatesFilter<"User"> | string
    prenom?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringWithAggregatesFilter<"User"> | string
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    iconUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    securityQuestion?: StringNullableWithAggregatesFilter<"User"> | string | null
    securityAnswer?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type ExerciceCreateInput = {
    id?: string
    nom: string
    description: string
    imageUrl?: string | null
    schemaUrl?: string | null
    materiel?: string | null
    notes?: string | null
    variablesText?: string | null
    variablesPlus?: string | null
    variablesMinus?: string | null
    createdAt?: Date | string
    tags?: TagCreateNestedManyWithoutExercicesInput
    entrainements?: EntrainementExerciceCreateNestedManyWithoutExerciceInput
  }

  export type ExerciceUncheckedCreateInput = {
    id?: string
    nom: string
    description: string
    imageUrl?: string | null
    schemaUrl?: string | null
    materiel?: string | null
    notes?: string | null
    variablesText?: string | null
    variablesPlus?: string | null
    variablesMinus?: string | null
    createdAt?: Date | string
    tags?: TagUncheckedCreateNestedManyWithoutExercicesInput
    entrainements?: EntrainementExerciceUncheckedCreateNestedManyWithoutExerciceInput
  }

  export type ExerciceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    schemaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    materiel?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    variablesText?: NullableStringFieldUpdateOperationsInput | string | null
    variablesPlus?: NullableStringFieldUpdateOperationsInput | string | null
    variablesMinus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUpdateManyWithoutExercicesNestedInput
    entrainements?: EntrainementExerciceUpdateManyWithoutExerciceNestedInput
  }

  export type ExerciceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    schemaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    materiel?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    variablesText?: NullableStringFieldUpdateOperationsInput | string | null
    variablesPlus?: NullableStringFieldUpdateOperationsInput | string | null
    variablesMinus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUncheckedUpdateManyWithoutExercicesNestedInput
    entrainements?: EntrainementExerciceUncheckedUpdateManyWithoutExerciceNestedInput
  }

  export type ExerciceCreateManyInput = {
    id?: string
    nom: string
    description: string
    imageUrl?: string | null
    schemaUrl?: string | null
    materiel?: string | null
    notes?: string | null
    variablesText?: string | null
    variablesPlus?: string | null
    variablesMinus?: string | null
    createdAt?: Date | string
  }

  export type ExerciceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    schemaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    materiel?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    variablesText?: NullableStringFieldUpdateOperationsInput | string | null
    variablesPlus?: NullableStringFieldUpdateOperationsInput | string | null
    variablesMinus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExerciceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    schemaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    materiel?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    variablesText?: NullableStringFieldUpdateOperationsInput | string | null
    variablesPlus?: NullableStringFieldUpdateOperationsInput | string | null
    variablesMinus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagCreateInput = {
    id?: string
    label: string
    category: string
    color?: string | null
    level?: number | null
    createdAt?: Date | string
    exercices?: ExerciceCreateNestedManyWithoutTagsInput
    entrainements?: EntrainementCreateNestedManyWithoutTagsInput
    situationsMatchs?: SituationMatchCreateNestedManyWithoutTagsInput
  }

  export type TagUncheckedCreateInput = {
    id?: string
    label: string
    category: string
    color?: string | null
    level?: number | null
    createdAt?: Date | string
    exercices?: ExerciceUncheckedCreateNestedManyWithoutTagsInput
    entrainements?: EntrainementUncheckedCreateNestedManyWithoutTagsInput
    situationsMatchs?: SituationMatchUncheckedCreateNestedManyWithoutTagsInput
  }

  export type TagUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: ExerciceUpdateManyWithoutTagsNestedInput
    entrainements?: EntrainementUpdateManyWithoutTagsNestedInput
    situationsMatchs?: SituationMatchUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: ExerciceUncheckedUpdateManyWithoutTagsNestedInput
    entrainements?: EntrainementUncheckedUpdateManyWithoutTagsNestedInput
    situationsMatchs?: SituationMatchUncheckedUpdateManyWithoutTagsNestedInput
  }

  export type TagCreateManyInput = {
    id?: string
    label: string
    category: string
    color?: string | null
    level?: number | null
    createdAt?: Date | string
  }

  export type TagUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementCreateInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    exercices?: EntrainementExerciceCreateNestedManyWithoutEntrainementInput
    tags?: TagCreateNestedManyWithoutEntrainementsInput
    echauffement?: EchauffementCreateNestedOneWithoutEntrainementsInput
    situationMatch?: SituationMatchCreateNestedOneWithoutEntrainementsInput
  }

  export type EntrainementUncheckedCreateInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    echauffementId?: string | null
    situationMatchId?: string | null
    exercices?: EntrainementExerciceUncheckedCreateNestedManyWithoutEntrainementInput
    tags?: TagUncheckedCreateNestedManyWithoutEntrainementsInput
  }

  export type EntrainementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: EntrainementExerciceUpdateManyWithoutEntrainementNestedInput
    tags?: TagUpdateManyWithoutEntrainementsNestedInput
    echauffement?: EchauffementUpdateOneWithoutEntrainementsNestedInput
    situationMatch?: SituationMatchUpdateOneWithoutEntrainementsNestedInput
  }

  export type EntrainementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    echauffementId?: NullableStringFieldUpdateOperationsInput | string | null
    situationMatchId?: NullableStringFieldUpdateOperationsInput | string | null
    exercices?: EntrainementExerciceUncheckedUpdateManyWithoutEntrainementNestedInput
    tags?: TagUncheckedUpdateManyWithoutEntrainementsNestedInput
  }

  export type EntrainementCreateManyInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    echauffementId?: string | null
    situationMatchId?: string | null
  }

  export type EntrainementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    echauffementId?: NullableStringFieldUpdateOperationsInput | string | null
    situationMatchId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type EntrainementExerciceCreateInput = {
    id?: string
    ordre: number
    duree?: number | null
    notes?: string | null
    createdAt?: Date | string
    entrainement: EntrainementCreateNestedOneWithoutExercicesInput
    exercice: ExerciceCreateNestedOneWithoutEntrainementsInput
  }

  export type EntrainementExerciceUncheckedCreateInput = {
    id?: string
    entrainementId: string
    exerciceId: string
    ordre: number
    duree?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type EntrainementExerciceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainement?: EntrainementUpdateOneRequiredWithoutExercicesNestedInput
    exercice?: ExerciceUpdateOneRequiredWithoutEntrainementsNestedInput
  }

  export type EntrainementExerciceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entrainementId?: StringFieldUpdateOperationsInput | string
    exerciceId?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementExerciceCreateManyInput = {
    id?: string
    entrainementId: string
    exerciceId: string
    ordre: number
    duree?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type EntrainementExerciceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementExerciceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    entrainementId?: StringFieldUpdateOperationsInput | string
    exerciceId?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EchauffementCreateInput = {
    id?: string
    nom: string
    description?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    blocs?: BlocEchauffementCreateNestedManyWithoutEchauffementInput
    entrainements?: EntrainementCreateNestedManyWithoutEchauffementInput
  }

  export type EchauffementUncheckedCreateInput = {
    id?: string
    nom: string
    description?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    blocs?: BlocEchauffementUncheckedCreateNestedManyWithoutEchauffementInput
    entrainements?: EntrainementUncheckedCreateNestedManyWithoutEchauffementInput
  }

  export type EchauffementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    blocs?: BlocEchauffementUpdateManyWithoutEchauffementNestedInput
    entrainements?: EntrainementUpdateManyWithoutEchauffementNestedInput
  }

  export type EchauffementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    blocs?: BlocEchauffementUncheckedUpdateManyWithoutEchauffementNestedInput
    entrainements?: EntrainementUncheckedUpdateManyWithoutEchauffementNestedInput
  }

  export type EchauffementCreateManyInput = {
    id?: string
    nom: string
    description?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
  }

  export type EchauffementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EchauffementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlocEchauffementCreateInput = {
    id?: string
    ordre: number
    titre: string
    repetitions?: string | null
    temps?: string | null
    informations?: string | null
    fonctionnement?: string | null
    notes?: string | null
    createdAt?: Date | string
    echauffement: EchauffementCreateNestedOneWithoutBlocsInput
  }

  export type BlocEchauffementUncheckedCreateInput = {
    id?: string
    echauffementId: string
    ordre: number
    titre: string
    repetitions?: string | null
    temps?: string | null
    informations?: string | null
    fonctionnement?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type BlocEchauffementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    titre?: StringFieldUpdateOperationsInput | string
    repetitions?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    informations?: NullableStringFieldUpdateOperationsInput | string | null
    fonctionnement?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    echauffement?: EchauffementUpdateOneRequiredWithoutBlocsNestedInput
  }

  export type BlocEchauffementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    echauffementId?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    titre?: StringFieldUpdateOperationsInput | string
    repetitions?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    informations?: NullableStringFieldUpdateOperationsInput | string | null
    fonctionnement?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlocEchauffementCreateManyInput = {
    id?: string
    echauffementId: string
    ordre: number
    titre: string
    repetitions?: string | null
    temps?: string | null
    informations?: string | null
    fonctionnement?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type BlocEchauffementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    titre?: StringFieldUpdateOperationsInput | string
    repetitions?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    informations?: NullableStringFieldUpdateOperationsInput | string | null
    fonctionnement?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlocEchauffementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    echauffementId?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    titre?: StringFieldUpdateOperationsInput | string
    repetitions?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    informations?: NullableStringFieldUpdateOperationsInput | string | null
    fonctionnement?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SituationMatchCreateInput = {
    id?: string
    nom?: string | null
    type: string
    description?: string | null
    temps?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    tags?: TagCreateNestedManyWithoutSituationsMatchsInput
    entrainements?: EntrainementCreateNestedManyWithoutSituationMatchInput
  }

  export type SituationMatchUncheckedCreateInput = {
    id?: string
    nom?: string | null
    type: string
    description?: string | null
    temps?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    tags?: TagUncheckedCreateNestedManyWithoutSituationsMatchsInput
    entrainements?: EntrainementUncheckedCreateNestedManyWithoutSituationMatchInput
  }

  export type SituationMatchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUpdateManyWithoutSituationsMatchsNestedInput
    entrainements?: EntrainementUpdateManyWithoutSituationMatchNestedInput
  }

  export type SituationMatchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUncheckedUpdateManyWithoutSituationsMatchsNestedInput
    entrainements?: EntrainementUncheckedUpdateManyWithoutSituationMatchNestedInput
  }

  export type SituationMatchCreateManyInput = {
    id?: string
    nom?: string | null
    type: string
    description?: string | null
    temps?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
  }

  export type SituationMatchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SituationMatchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    password?: string | null
    nom: string
    prenom?: string | null
    role?: string
    isActive?: boolean
    iconUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    securityQuestion?: string | null
    securityAnswer?: string | null
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    password?: string | null
    nom: string
    prenom?: string | null
    role?: string
    isActive?: boolean
    iconUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    securityQuestion?: string | null
    securityAnswer?: string | null
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    securityQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    securityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    securityQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    securityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    password?: string | null
    nom: string
    prenom?: string | null
    role?: string
    isActive?: boolean
    iconUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    securityQuestion?: string | null
    securityAnswer?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    securityQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    securityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    securityQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    securityAnswer?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type TagListRelationFilter = {
    every?: TagWhereInput
    some?: TagWhereInput
    none?: TagWhereInput
  }

  export type EntrainementExerciceListRelationFilter = {
    every?: EntrainementExerciceWhereInput
    some?: EntrainementExerciceWhereInput
    none?: EntrainementExerciceWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EntrainementExerciceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ExerciceCountOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    schemaUrl?: SortOrder
    materiel?: SortOrder
    notes?: SortOrder
    variablesText?: SortOrder
    variablesPlus?: SortOrder
    variablesMinus?: SortOrder
    createdAt?: SortOrder
  }

  export type ExerciceMaxOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    schemaUrl?: SortOrder
    materiel?: SortOrder
    notes?: SortOrder
    variablesText?: SortOrder
    variablesPlus?: SortOrder
    variablesMinus?: SortOrder
    createdAt?: SortOrder
  }

  export type ExerciceMinOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    schemaUrl?: SortOrder
    materiel?: SortOrder
    notes?: SortOrder
    variablesText?: SortOrder
    variablesPlus?: SortOrder
    variablesMinus?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ExerciceListRelationFilter = {
    every?: ExerciceWhereInput
    some?: ExerciceWhereInput
    none?: ExerciceWhereInput
  }

  export type EntrainementListRelationFilter = {
    every?: EntrainementWhereInput
    some?: EntrainementWhereInput
    none?: EntrainementWhereInput
  }

  export type SituationMatchListRelationFilter = {
    every?: SituationMatchWhereInput
    some?: SituationMatchWhereInput
    none?: SituationMatchWhereInput
  }

  export type ExerciceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EntrainementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SituationMatchOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TagLabelCategoryCompoundUniqueInput = {
    label: string
    category: string
  }

  export type TagCountOrderByAggregateInput = {
    id?: SortOrder
    label?: SortOrder
    category?: SortOrder
    color?: SortOrder
    level?: SortOrder
    createdAt?: SortOrder
  }

  export type TagAvgOrderByAggregateInput = {
    level?: SortOrder
  }

  export type TagMaxOrderByAggregateInput = {
    id?: SortOrder
    label?: SortOrder
    category?: SortOrder
    color?: SortOrder
    level?: SortOrder
    createdAt?: SortOrder
  }

  export type TagMinOrderByAggregateInput = {
    id?: SortOrder
    label?: SortOrder
    category?: SortOrder
    color?: SortOrder
    level?: SortOrder
    createdAt?: SortOrder
  }

  export type TagSumOrderByAggregateInput = {
    level?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EchauffementNullableRelationFilter = {
    is?: EchauffementWhereInput | null
    isNot?: EchauffementWhereInput | null
  }

  export type SituationMatchNullableRelationFilter = {
    is?: SituationMatchWhereInput | null
    isNot?: SituationMatchWhereInput | null
  }

  export type EntrainementCountOrderByAggregateInput = {
    id?: SortOrder
    titre?: SortOrder
    date?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
    echauffementId?: SortOrder
    situationMatchId?: SortOrder
  }

  export type EntrainementMaxOrderByAggregateInput = {
    id?: SortOrder
    titre?: SortOrder
    date?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
    echauffementId?: SortOrder
    situationMatchId?: SortOrder
  }

  export type EntrainementMinOrderByAggregateInput = {
    id?: SortOrder
    titre?: SortOrder
    date?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
    echauffementId?: SortOrder
    situationMatchId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EntrainementRelationFilter = {
    is?: EntrainementWhereInput
    isNot?: EntrainementWhereInput
  }

  export type ExerciceRelationFilter = {
    is?: ExerciceWhereInput
    isNot?: ExerciceWhereInput
  }

  export type EntrainementExerciceEntrainementIdExerciceIdCompoundUniqueInput = {
    entrainementId: string
    exerciceId: string
  }

  export type EntrainementExerciceCountOrderByAggregateInput = {
    id?: SortOrder
    entrainementId?: SortOrder
    exerciceId?: SortOrder
    ordre?: SortOrder
    duree?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type EntrainementExerciceAvgOrderByAggregateInput = {
    ordre?: SortOrder
    duree?: SortOrder
  }

  export type EntrainementExerciceMaxOrderByAggregateInput = {
    id?: SortOrder
    entrainementId?: SortOrder
    exerciceId?: SortOrder
    ordre?: SortOrder
    duree?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type EntrainementExerciceMinOrderByAggregateInput = {
    id?: SortOrder
    entrainementId?: SortOrder
    exerciceId?: SortOrder
    ordre?: SortOrder
    duree?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type EntrainementExerciceSumOrderByAggregateInput = {
    ordre?: SortOrder
    duree?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BlocEchauffementListRelationFilter = {
    every?: BlocEchauffementWhereInput
    some?: BlocEchauffementWhereInput
    none?: BlocEchauffementWhereInput
  }

  export type BlocEchauffementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EchauffementCountOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type EchauffementMaxOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type EchauffementMinOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type EchauffementRelationFilter = {
    is?: EchauffementWhereInput
    isNot?: EchauffementWhereInput
  }

  export type BlocEchauffementEchauffementIdOrdreCompoundUniqueInput = {
    echauffementId: string
    ordre: number
  }

  export type BlocEchauffementCountOrderByAggregateInput = {
    id?: SortOrder
    echauffementId?: SortOrder
    ordre?: SortOrder
    titre?: SortOrder
    repetitions?: SortOrder
    temps?: SortOrder
    informations?: SortOrder
    fonctionnement?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type BlocEchauffementAvgOrderByAggregateInput = {
    ordre?: SortOrder
  }

  export type BlocEchauffementMaxOrderByAggregateInput = {
    id?: SortOrder
    echauffementId?: SortOrder
    ordre?: SortOrder
    titre?: SortOrder
    repetitions?: SortOrder
    temps?: SortOrder
    informations?: SortOrder
    fonctionnement?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type BlocEchauffementMinOrderByAggregateInput = {
    id?: SortOrder
    echauffementId?: SortOrder
    ordre?: SortOrder
    titre?: SortOrder
    repetitions?: SortOrder
    temps?: SortOrder
    informations?: SortOrder
    fonctionnement?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type BlocEchauffementSumOrderByAggregateInput = {
    ordre?: SortOrder
  }

  export type SituationMatchCountOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    type?: SortOrder
    description?: SortOrder
    temps?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type SituationMatchMaxOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    type?: SortOrder
    description?: SortOrder
    temps?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type SituationMatchMinOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    type?: SortOrder
    description?: SortOrder
    temps?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    iconUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    securityQuestion?: SortOrder
    securityAnswer?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    iconUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    securityQuestion?: SortOrder
    securityAnswer?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    iconUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    securityQuestion?: SortOrder
    securityAnswer?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type TagCreateNestedManyWithoutExercicesInput = {
    create?: XOR<TagCreateWithoutExercicesInput, TagUncheckedCreateWithoutExercicesInput> | TagCreateWithoutExercicesInput[] | TagUncheckedCreateWithoutExercicesInput[]
    connectOrCreate?: TagCreateOrConnectWithoutExercicesInput | TagCreateOrConnectWithoutExercicesInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type EntrainementExerciceCreateNestedManyWithoutExerciceInput = {
    create?: XOR<EntrainementExerciceCreateWithoutExerciceInput, EntrainementExerciceUncheckedCreateWithoutExerciceInput> | EntrainementExerciceCreateWithoutExerciceInput[] | EntrainementExerciceUncheckedCreateWithoutExerciceInput[]
    connectOrCreate?: EntrainementExerciceCreateOrConnectWithoutExerciceInput | EntrainementExerciceCreateOrConnectWithoutExerciceInput[]
    createMany?: EntrainementExerciceCreateManyExerciceInputEnvelope
    connect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
  }

  export type TagUncheckedCreateNestedManyWithoutExercicesInput = {
    create?: XOR<TagCreateWithoutExercicesInput, TagUncheckedCreateWithoutExercicesInput> | TagCreateWithoutExercicesInput[] | TagUncheckedCreateWithoutExercicesInput[]
    connectOrCreate?: TagCreateOrConnectWithoutExercicesInput | TagCreateOrConnectWithoutExercicesInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type EntrainementExerciceUncheckedCreateNestedManyWithoutExerciceInput = {
    create?: XOR<EntrainementExerciceCreateWithoutExerciceInput, EntrainementExerciceUncheckedCreateWithoutExerciceInput> | EntrainementExerciceCreateWithoutExerciceInput[] | EntrainementExerciceUncheckedCreateWithoutExerciceInput[]
    connectOrCreate?: EntrainementExerciceCreateOrConnectWithoutExerciceInput | EntrainementExerciceCreateOrConnectWithoutExerciceInput[]
    createMany?: EntrainementExerciceCreateManyExerciceInputEnvelope
    connect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TagUpdateManyWithoutExercicesNestedInput = {
    create?: XOR<TagCreateWithoutExercicesInput, TagUncheckedCreateWithoutExercicesInput> | TagCreateWithoutExercicesInput[] | TagUncheckedCreateWithoutExercicesInput[]
    connectOrCreate?: TagCreateOrConnectWithoutExercicesInput | TagCreateOrConnectWithoutExercicesInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutExercicesInput | TagUpsertWithWhereUniqueWithoutExercicesInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutExercicesInput | TagUpdateWithWhereUniqueWithoutExercicesInput[]
    updateMany?: TagUpdateManyWithWhereWithoutExercicesInput | TagUpdateManyWithWhereWithoutExercicesInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type EntrainementExerciceUpdateManyWithoutExerciceNestedInput = {
    create?: XOR<EntrainementExerciceCreateWithoutExerciceInput, EntrainementExerciceUncheckedCreateWithoutExerciceInput> | EntrainementExerciceCreateWithoutExerciceInput[] | EntrainementExerciceUncheckedCreateWithoutExerciceInput[]
    connectOrCreate?: EntrainementExerciceCreateOrConnectWithoutExerciceInput | EntrainementExerciceCreateOrConnectWithoutExerciceInput[]
    upsert?: EntrainementExerciceUpsertWithWhereUniqueWithoutExerciceInput | EntrainementExerciceUpsertWithWhereUniqueWithoutExerciceInput[]
    createMany?: EntrainementExerciceCreateManyExerciceInputEnvelope
    set?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    disconnect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    delete?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    connect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    update?: EntrainementExerciceUpdateWithWhereUniqueWithoutExerciceInput | EntrainementExerciceUpdateWithWhereUniqueWithoutExerciceInput[]
    updateMany?: EntrainementExerciceUpdateManyWithWhereWithoutExerciceInput | EntrainementExerciceUpdateManyWithWhereWithoutExerciceInput[]
    deleteMany?: EntrainementExerciceScalarWhereInput | EntrainementExerciceScalarWhereInput[]
  }

  export type TagUncheckedUpdateManyWithoutExercicesNestedInput = {
    create?: XOR<TagCreateWithoutExercicesInput, TagUncheckedCreateWithoutExercicesInput> | TagCreateWithoutExercicesInput[] | TagUncheckedCreateWithoutExercicesInput[]
    connectOrCreate?: TagCreateOrConnectWithoutExercicesInput | TagCreateOrConnectWithoutExercicesInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutExercicesInput | TagUpsertWithWhereUniqueWithoutExercicesInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutExercicesInput | TagUpdateWithWhereUniqueWithoutExercicesInput[]
    updateMany?: TagUpdateManyWithWhereWithoutExercicesInput | TagUpdateManyWithWhereWithoutExercicesInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type EntrainementExerciceUncheckedUpdateManyWithoutExerciceNestedInput = {
    create?: XOR<EntrainementExerciceCreateWithoutExerciceInput, EntrainementExerciceUncheckedCreateWithoutExerciceInput> | EntrainementExerciceCreateWithoutExerciceInput[] | EntrainementExerciceUncheckedCreateWithoutExerciceInput[]
    connectOrCreate?: EntrainementExerciceCreateOrConnectWithoutExerciceInput | EntrainementExerciceCreateOrConnectWithoutExerciceInput[]
    upsert?: EntrainementExerciceUpsertWithWhereUniqueWithoutExerciceInput | EntrainementExerciceUpsertWithWhereUniqueWithoutExerciceInput[]
    createMany?: EntrainementExerciceCreateManyExerciceInputEnvelope
    set?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    disconnect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    delete?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    connect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    update?: EntrainementExerciceUpdateWithWhereUniqueWithoutExerciceInput | EntrainementExerciceUpdateWithWhereUniqueWithoutExerciceInput[]
    updateMany?: EntrainementExerciceUpdateManyWithWhereWithoutExerciceInput | EntrainementExerciceUpdateManyWithWhereWithoutExerciceInput[]
    deleteMany?: EntrainementExerciceScalarWhereInput | EntrainementExerciceScalarWhereInput[]
  }

  export type ExerciceCreateNestedManyWithoutTagsInput = {
    create?: XOR<ExerciceCreateWithoutTagsInput, ExerciceUncheckedCreateWithoutTagsInput> | ExerciceCreateWithoutTagsInput[] | ExerciceUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: ExerciceCreateOrConnectWithoutTagsInput | ExerciceCreateOrConnectWithoutTagsInput[]
    connect?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
  }

  export type EntrainementCreateNestedManyWithoutTagsInput = {
    create?: XOR<EntrainementCreateWithoutTagsInput, EntrainementUncheckedCreateWithoutTagsInput> | EntrainementCreateWithoutTagsInput[] | EntrainementUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutTagsInput | EntrainementCreateOrConnectWithoutTagsInput[]
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
  }

  export type SituationMatchCreateNestedManyWithoutTagsInput = {
    create?: XOR<SituationMatchCreateWithoutTagsInput, SituationMatchUncheckedCreateWithoutTagsInput> | SituationMatchCreateWithoutTagsInput[] | SituationMatchUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: SituationMatchCreateOrConnectWithoutTagsInput | SituationMatchCreateOrConnectWithoutTagsInput[]
    connect?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
  }

  export type ExerciceUncheckedCreateNestedManyWithoutTagsInput = {
    create?: XOR<ExerciceCreateWithoutTagsInput, ExerciceUncheckedCreateWithoutTagsInput> | ExerciceCreateWithoutTagsInput[] | ExerciceUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: ExerciceCreateOrConnectWithoutTagsInput | ExerciceCreateOrConnectWithoutTagsInput[]
    connect?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
  }

  export type EntrainementUncheckedCreateNestedManyWithoutTagsInput = {
    create?: XOR<EntrainementCreateWithoutTagsInput, EntrainementUncheckedCreateWithoutTagsInput> | EntrainementCreateWithoutTagsInput[] | EntrainementUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutTagsInput | EntrainementCreateOrConnectWithoutTagsInput[]
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
  }

  export type SituationMatchUncheckedCreateNestedManyWithoutTagsInput = {
    create?: XOR<SituationMatchCreateWithoutTagsInput, SituationMatchUncheckedCreateWithoutTagsInput> | SituationMatchCreateWithoutTagsInput[] | SituationMatchUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: SituationMatchCreateOrConnectWithoutTagsInput | SituationMatchCreateOrConnectWithoutTagsInput[]
    connect?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ExerciceUpdateManyWithoutTagsNestedInput = {
    create?: XOR<ExerciceCreateWithoutTagsInput, ExerciceUncheckedCreateWithoutTagsInput> | ExerciceCreateWithoutTagsInput[] | ExerciceUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: ExerciceCreateOrConnectWithoutTagsInput | ExerciceCreateOrConnectWithoutTagsInput[]
    upsert?: ExerciceUpsertWithWhereUniqueWithoutTagsInput | ExerciceUpsertWithWhereUniqueWithoutTagsInput[]
    set?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
    disconnect?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
    delete?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
    connect?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
    update?: ExerciceUpdateWithWhereUniqueWithoutTagsInput | ExerciceUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: ExerciceUpdateManyWithWhereWithoutTagsInput | ExerciceUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: ExerciceScalarWhereInput | ExerciceScalarWhereInput[]
  }

  export type EntrainementUpdateManyWithoutTagsNestedInput = {
    create?: XOR<EntrainementCreateWithoutTagsInput, EntrainementUncheckedCreateWithoutTagsInput> | EntrainementCreateWithoutTagsInput[] | EntrainementUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutTagsInput | EntrainementCreateOrConnectWithoutTagsInput[]
    upsert?: EntrainementUpsertWithWhereUniqueWithoutTagsInput | EntrainementUpsertWithWhereUniqueWithoutTagsInput[]
    set?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    disconnect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    delete?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    update?: EntrainementUpdateWithWhereUniqueWithoutTagsInput | EntrainementUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: EntrainementUpdateManyWithWhereWithoutTagsInput | EntrainementUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: EntrainementScalarWhereInput | EntrainementScalarWhereInput[]
  }

  export type SituationMatchUpdateManyWithoutTagsNestedInput = {
    create?: XOR<SituationMatchCreateWithoutTagsInput, SituationMatchUncheckedCreateWithoutTagsInput> | SituationMatchCreateWithoutTagsInput[] | SituationMatchUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: SituationMatchCreateOrConnectWithoutTagsInput | SituationMatchCreateOrConnectWithoutTagsInput[]
    upsert?: SituationMatchUpsertWithWhereUniqueWithoutTagsInput | SituationMatchUpsertWithWhereUniqueWithoutTagsInput[]
    set?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
    disconnect?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
    delete?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
    connect?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
    update?: SituationMatchUpdateWithWhereUniqueWithoutTagsInput | SituationMatchUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: SituationMatchUpdateManyWithWhereWithoutTagsInput | SituationMatchUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: SituationMatchScalarWhereInput | SituationMatchScalarWhereInput[]
  }

  export type ExerciceUncheckedUpdateManyWithoutTagsNestedInput = {
    create?: XOR<ExerciceCreateWithoutTagsInput, ExerciceUncheckedCreateWithoutTagsInput> | ExerciceCreateWithoutTagsInput[] | ExerciceUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: ExerciceCreateOrConnectWithoutTagsInput | ExerciceCreateOrConnectWithoutTagsInput[]
    upsert?: ExerciceUpsertWithWhereUniqueWithoutTagsInput | ExerciceUpsertWithWhereUniqueWithoutTagsInput[]
    set?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
    disconnect?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
    delete?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
    connect?: ExerciceWhereUniqueInput | ExerciceWhereUniqueInput[]
    update?: ExerciceUpdateWithWhereUniqueWithoutTagsInput | ExerciceUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: ExerciceUpdateManyWithWhereWithoutTagsInput | ExerciceUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: ExerciceScalarWhereInput | ExerciceScalarWhereInput[]
  }

  export type EntrainementUncheckedUpdateManyWithoutTagsNestedInput = {
    create?: XOR<EntrainementCreateWithoutTagsInput, EntrainementUncheckedCreateWithoutTagsInput> | EntrainementCreateWithoutTagsInput[] | EntrainementUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutTagsInput | EntrainementCreateOrConnectWithoutTagsInput[]
    upsert?: EntrainementUpsertWithWhereUniqueWithoutTagsInput | EntrainementUpsertWithWhereUniqueWithoutTagsInput[]
    set?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    disconnect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    delete?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    update?: EntrainementUpdateWithWhereUniqueWithoutTagsInput | EntrainementUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: EntrainementUpdateManyWithWhereWithoutTagsInput | EntrainementUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: EntrainementScalarWhereInput | EntrainementScalarWhereInput[]
  }

  export type SituationMatchUncheckedUpdateManyWithoutTagsNestedInput = {
    create?: XOR<SituationMatchCreateWithoutTagsInput, SituationMatchUncheckedCreateWithoutTagsInput> | SituationMatchCreateWithoutTagsInput[] | SituationMatchUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: SituationMatchCreateOrConnectWithoutTagsInput | SituationMatchCreateOrConnectWithoutTagsInput[]
    upsert?: SituationMatchUpsertWithWhereUniqueWithoutTagsInput | SituationMatchUpsertWithWhereUniqueWithoutTagsInput[]
    set?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
    disconnect?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
    delete?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
    connect?: SituationMatchWhereUniqueInput | SituationMatchWhereUniqueInput[]
    update?: SituationMatchUpdateWithWhereUniqueWithoutTagsInput | SituationMatchUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: SituationMatchUpdateManyWithWhereWithoutTagsInput | SituationMatchUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: SituationMatchScalarWhereInput | SituationMatchScalarWhereInput[]
  }

  export type EntrainementExerciceCreateNestedManyWithoutEntrainementInput = {
    create?: XOR<EntrainementExerciceCreateWithoutEntrainementInput, EntrainementExerciceUncheckedCreateWithoutEntrainementInput> | EntrainementExerciceCreateWithoutEntrainementInput[] | EntrainementExerciceUncheckedCreateWithoutEntrainementInput[]
    connectOrCreate?: EntrainementExerciceCreateOrConnectWithoutEntrainementInput | EntrainementExerciceCreateOrConnectWithoutEntrainementInput[]
    createMany?: EntrainementExerciceCreateManyEntrainementInputEnvelope
    connect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
  }

  export type TagCreateNestedManyWithoutEntrainementsInput = {
    create?: XOR<TagCreateWithoutEntrainementsInput, TagUncheckedCreateWithoutEntrainementsInput> | TagCreateWithoutEntrainementsInput[] | TagUncheckedCreateWithoutEntrainementsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutEntrainementsInput | TagCreateOrConnectWithoutEntrainementsInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type EchauffementCreateNestedOneWithoutEntrainementsInput = {
    create?: XOR<EchauffementCreateWithoutEntrainementsInput, EchauffementUncheckedCreateWithoutEntrainementsInput>
    connectOrCreate?: EchauffementCreateOrConnectWithoutEntrainementsInput
    connect?: EchauffementWhereUniqueInput
  }

  export type SituationMatchCreateNestedOneWithoutEntrainementsInput = {
    create?: XOR<SituationMatchCreateWithoutEntrainementsInput, SituationMatchUncheckedCreateWithoutEntrainementsInput>
    connectOrCreate?: SituationMatchCreateOrConnectWithoutEntrainementsInput
    connect?: SituationMatchWhereUniqueInput
  }

  export type EntrainementExerciceUncheckedCreateNestedManyWithoutEntrainementInput = {
    create?: XOR<EntrainementExerciceCreateWithoutEntrainementInput, EntrainementExerciceUncheckedCreateWithoutEntrainementInput> | EntrainementExerciceCreateWithoutEntrainementInput[] | EntrainementExerciceUncheckedCreateWithoutEntrainementInput[]
    connectOrCreate?: EntrainementExerciceCreateOrConnectWithoutEntrainementInput | EntrainementExerciceCreateOrConnectWithoutEntrainementInput[]
    createMany?: EntrainementExerciceCreateManyEntrainementInputEnvelope
    connect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
  }

  export type TagUncheckedCreateNestedManyWithoutEntrainementsInput = {
    create?: XOR<TagCreateWithoutEntrainementsInput, TagUncheckedCreateWithoutEntrainementsInput> | TagCreateWithoutEntrainementsInput[] | TagUncheckedCreateWithoutEntrainementsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutEntrainementsInput | TagCreateOrConnectWithoutEntrainementsInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EntrainementExerciceUpdateManyWithoutEntrainementNestedInput = {
    create?: XOR<EntrainementExerciceCreateWithoutEntrainementInput, EntrainementExerciceUncheckedCreateWithoutEntrainementInput> | EntrainementExerciceCreateWithoutEntrainementInput[] | EntrainementExerciceUncheckedCreateWithoutEntrainementInput[]
    connectOrCreate?: EntrainementExerciceCreateOrConnectWithoutEntrainementInput | EntrainementExerciceCreateOrConnectWithoutEntrainementInput[]
    upsert?: EntrainementExerciceUpsertWithWhereUniqueWithoutEntrainementInput | EntrainementExerciceUpsertWithWhereUniqueWithoutEntrainementInput[]
    createMany?: EntrainementExerciceCreateManyEntrainementInputEnvelope
    set?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    disconnect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    delete?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    connect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    update?: EntrainementExerciceUpdateWithWhereUniqueWithoutEntrainementInput | EntrainementExerciceUpdateWithWhereUniqueWithoutEntrainementInput[]
    updateMany?: EntrainementExerciceUpdateManyWithWhereWithoutEntrainementInput | EntrainementExerciceUpdateManyWithWhereWithoutEntrainementInput[]
    deleteMany?: EntrainementExerciceScalarWhereInput | EntrainementExerciceScalarWhereInput[]
  }

  export type TagUpdateManyWithoutEntrainementsNestedInput = {
    create?: XOR<TagCreateWithoutEntrainementsInput, TagUncheckedCreateWithoutEntrainementsInput> | TagCreateWithoutEntrainementsInput[] | TagUncheckedCreateWithoutEntrainementsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutEntrainementsInput | TagCreateOrConnectWithoutEntrainementsInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutEntrainementsInput | TagUpsertWithWhereUniqueWithoutEntrainementsInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutEntrainementsInput | TagUpdateWithWhereUniqueWithoutEntrainementsInput[]
    updateMany?: TagUpdateManyWithWhereWithoutEntrainementsInput | TagUpdateManyWithWhereWithoutEntrainementsInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type EchauffementUpdateOneWithoutEntrainementsNestedInput = {
    create?: XOR<EchauffementCreateWithoutEntrainementsInput, EchauffementUncheckedCreateWithoutEntrainementsInput>
    connectOrCreate?: EchauffementCreateOrConnectWithoutEntrainementsInput
    upsert?: EchauffementUpsertWithoutEntrainementsInput
    disconnect?: EchauffementWhereInput | boolean
    delete?: EchauffementWhereInput | boolean
    connect?: EchauffementWhereUniqueInput
    update?: XOR<XOR<EchauffementUpdateToOneWithWhereWithoutEntrainementsInput, EchauffementUpdateWithoutEntrainementsInput>, EchauffementUncheckedUpdateWithoutEntrainementsInput>
  }

  export type SituationMatchUpdateOneWithoutEntrainementsNestedInput = {
    create?: XOR<SituationMatchCreateWithoutEntrainementsInput, SituationMatchUncheckedCreateWithoutEntrainementsInput>
    connectOrCreate?: SituationMatchCreateOrConnectWithoutEntrainementsInput
    upsert?: SituationMatchUpsertWithoutEntrainementsInput
    disconnect?: SituationMatchWhereInput | boolean
    delete?: SituationMatchWhereInput | boolean
    connect?: SituationMatchWhereUniqueInput
    update?: XOR<XOR<SituationMatchUpdateToOneWithWhereWithoutEntrainementsInput, SituationMatchUpdateWithoutEntrainementsInput>, SituationMatchUncheckedUpdateWithoutEntrainementsInput>
  }

  export type EntrainementExerciceUncheckedUpdateManyWithoutEntrainementNestedInput = {
    create?: XOR<EntrainementExerciceCreateWithoutEntrainementInput, EntrainementExerciceUncheckedCreateWithoutEntrainementInput> | EntrainementExerciceCreateWithoutEntrainementInput[] | EntrainementExerciceUncheckedCreateWithoutEntrainementInput[]
    connectOrCreate?: EntrainementExerciceCreateOrConnectWithoutEntrainementInput | EntrainementExerciceCreateOrConnectWithoutEntrainementInput[]
    upsert?: EntrainementExerciceUpsertWithWhereUniqueWithoutEntrainementInput | EntrainementExerciceUpsertWithWhereUniqueWithoutEntrainementInput[]
    createMany?: EntrainementExerciceCreateManyEntrainementInputEnvelope
    set?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    disconnect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    delete?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    connect?: EntrainementExerciceWhereUniqueInput | EntrainementExerciceWhereUniqueInput[]
    update?: EntrainementExerciceUpdateWithWhereUniqueWithoutEntrainementInput | EntrainementExerciceUpdateWithWhereUniqueWithoutEntrainementInput[]
    updateMany?: EntrainementExerciceUpdateManyWithWhereWithoutEntrainementInput | EntrainementExerciceUpdateManyWithWhereWithoutEntrainementInput[]
    deleteMany?: EntrainementExerciceScalarWhereInput | EntrainementExerciceScalarWhereInput[]
  }

  export type TagUncheckedUpdateManyWithoutEntrainementsNestedInput = {
    create?: XOR<TagCreateWithoutEntrainementsInput, TagUncheckedCreateWithoutEntrainementsInput> | TagCreateWithoutEntrainementsInput[] | TagUncheckedCreateWithoutEntrainementsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutEntrainementsInput | TagCreateOrConnectWithoutEntrainementsInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutEntrainementsInput | TagUpsertWithWhereUniqueWithoutEntrainementsInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutEntrainementsInput | TagUpdateWithWhereUniqueWithoutEntrainementsInput[]
    updateMany?: TagUpdateManyWithWhereWithoutEntrainementsInput | TagUpdateManyWithWhereWithoutEntrainementsInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type EntrainementCreateNestedOneWithoutExercicesInput = {
    create?: XOR<EntrainementCreateWithoutExercicesInput, EntrainementUncheckedCreateWithoutExercicesInput>
    connectOrCreate?: EntrainementCreateOrConnectWithoutExercicesInput
    connect?: EntrainementWhereUniqueInput
  }

  export type ExerciceCreateNestedOneWithoutEntrainementsInput = {
    create?: XOR<ExerciceCreateWithoutEntrainementsInput, ExerciceUncheckedCreateWithoutEntrainementsInput>
    connectOrCreate?: ExerciceCreateOrConnectWithoutEntrainementsInput
    connect?: ExerciceWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EntrainementUpdateOneRequiredWithoutExercicesNestedInput = {
    create?: XOR<EntrainementCreateWithoutExercicesInput, EntrainementUncheckedCreateWithoutExercicesInput>
    connectOrCreate?: EntrainementCreateOrConnectWithoutExercicesInput
    upsert?: EntrainementUpsertWithoutExercicesInput
    connect?: EntrainementWhereUniqueInput
    update?: XOR<XOR<EntrainementUpdateToOneWithWhereWithoutExercicesInput, EntrainementUpdateWithoutExercicesInput>, EntrainementUncheckedUpdateWithoutExercicesInput>
  }

  export type ExerciceUpdateOneRequiredWithoutEntrainementsNestedInput = {
    create?: XOR<ExerciceCreateWithoutEntrainementsInput, ExerciceUncheckedCreateWithoutEntrainementsInput>
    connectOrCreate?: ExerciceCreateOrConnectWithoutEntrainementsInput
    upsert?: ExerciceUpsertWithoutEntrainementsInput
    connect?: ExerciceWhereUniqueInput
    update?: XOR<XOR<ExerciceUpdateToOneWithWhereWithoutEntrainementsInput, ExerciceUpdateWithoutEntrainementsInput>, ExerciceUncheckedUpdateWithoutEntrainementsInput>
  }

  export type BlocEchauffementCreateNestedManyWithoutEchauffementInput = {
    create?: XOR<BlocEchauffementCreateWithoutEchauffementInput, BlocEchauffementUncheckedCreateWithoutEchauffementInput> | BlocEchauffementCreateWithoutEchauffementInput[] | BlocEchauffementUncheckedCreateWithoutEchauffementInput[]
    connectOrCreate?: BlocEchauffementCreateOrConnectWithoutEchauffementInput | BlocEchauffementCreateOrConnectWithoutEchauffementInput[]
    createMany?: BlocEchauffementCreateManyEchauffementInputEnvelope
    connect?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
  }

  export type EntrainementCreateNestedManyWithoutEchauffementInput = {
    create?: XOR<EntrainementCreateWithoutEchauffementInput, EntrainementUncheckedCreateWithoutEchauffementInput> | EntrainementCreateWithoutEchauffementInput[] | EntrainementUncheckedCreateWithoutEchauffementInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutEchauffementInput | EntrainementCreateOrConnectWithoutEchauffementInput[]
    createMany?: EntrainementCreateManyEchauffementInputEnvelope
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
  }

  export type BlocEchauffementUncheckedCreateNestedManyWithoutEchauffementInput = {
    create?: XOR<BlocEchauffementCreateWithoutEchauffementInput, BlocEchauffementUncheckedCreateWithoutEchauffementInput> | BlocEchauffementCreateWithoutEchauffementInput[] | BlocEchauffementUncheckedCreateWithoutEchauffementInput[]
    connectOrCreate?: BlocEchauffementCreateOrConnectWithoutEchauffementInput | BlocEchauffementCreateOrConnectWithoutEchauffementInput[]
    createMany?: BlocEchauffementCreateManyEchauffementInputEnvelope
    connect?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
  }

  export type EntrainementUncheckedCreateNestedManyWithoutEchauffementInput = {
    create?: XOR<EntrainementCreateWithoutEchauffementInput, EntrainementUncheckedCreateWithoutEchauffementInput> | EntrainementCreateWithoutEchauffementInput[] | EntrainementUncheckedCreateWithoutEchauffementInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutEchauffementInput | EntrainementCreateOrConnectWithoutEchauffementInput[]
    createMany?: EntrainementCreateManyEchauffementInputEnvelope
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
  }

  export type BlocEchauffementUpdateManyWithoutEchauffementNestedInput = {
    create?: XOR<BlocEchauffementCreateWithoutEchauffementInput, BlocEchauffementUncheckedCreateWithoutEchauffementInput> | BlocEchauffementCreateWithoutEchauffementInput[] | BlocEchauffementUncheckedCreateWithoutEchauffementInput[]
    connectOrCreate?: BlocEchauffementCreateOrConnectWithoutEchauffementInput | BlocEchauffementCreateOrConnectWithoutEchauffementInput[]
    upsert?: BlocEchauffementUpsertWithWhereUniqueWithoutEchauffementInput | BlocEchauffementUpsertWithWhereUniqueWithoutEchauffementInput[]
    createMany?: BlocEchauffementCreateManyEchauffementInputEnvelope
    set?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
    disconnect?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
    delete?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
    connect?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
    update?: BlocEchauffementUpdateWithWhereUniqueWithoutEchauffementInput | BlocEchauffementUpdateWithWhereUniqueWithoutEchauffementInput[]
    updateMany?: BlocEchauffementUpdateManyWithWhereWithoutEchauffementInput | BlocEchauffementUpdateManyWithWhereWithoutEchauffementInput[]
    deleteMany?: BlocEchauffementScalarWhereInput | BlocEchauffementScalarWhereInput[]
  }

  export type EntrainementUpdateManyWithoutEchauffementNestedInput = {
    create?: XOR<EntrainementCreateWithoutEchauffementInput, EntrainementUncheckedCreateWithoutEchauffementInput> | EntrainementCreateWithoutEchauffementInput[] | EntrainementUncheckedCreateWithoutEchauffementInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutEchauffementInput | EntrainementCreateOrConnectWithoutEchauffementInput[]
    upsert?: EntrainementUpsertWithWhereUniqueWithoutEchauffementInput | EntrainementUpsertWithWhereUniqueWithoutEchauffementInput[]
    createMany?: EntrainementCreateManyEchauffementInputEnvelope
    set?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    disconnect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    delete?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    update?: EntrainementUpdateWithWhereUniqueWithoutEchauffementInput | EntrainementUpdateWithWhereUniqueWithoutEchauffementInput[]
    updateMany?: EntrainementUpdateManyWithWhereWithoutEchauffementInput | EntrainementUpdateManyWithWhereWithoutEchauffementInput[]
    deleteMany?: EntrainementScalarWhereInput | EntrainementScalarWhereInput[]
  }

  export type BlocEchauffementUncheckedUpdateManyWithoutEchauffementNestedInput = {
    create?: XOR<BlocEchauffementCreateWithoutEchauffementInput, BlocEchauffementUncheckedCreateWithoutEchauffementInput> | BlocEchauffementCreateWithoutEchauffementInput[] | BlocEchauffementUncheckedCreateWithoutEchauffementInput[]
    connectOrCreate?: BlocEchauffementCreateOrConnectWithoutEchauffementInput | BlocEchauffementCreateOrConnectWithoutEchauffementInput[]
    upsert?: BlocEchauffementUpsertWithWhereUniqueWithoutEchauffementInput | BlocEchauffementUpsertWithWhereUniqueWithoutEchauffementInput[]
    createMany?: BlocEchauffementCreateManyEchauffementInputEnvelope
    set?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
    disconnect?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
    delete?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
    connect?: BlocEchauffementWhereUniqueInput | BlocEchauffementWhereUniqueInput[]
    update?: BlocEchauffementUpdateWithWhereUniqueWithoutEchauffementInput | BlocEchauffementUpdateWithWhereUniqueWithoutEchauffementInput[]
    updateMany?: BlocEchauffementUpdateManyWithWhereWithoutEchauffementInput | BlocEchauffementUpdateManyWithWhereWithoutEchauffementInput[]
    deleteMany?: BlocEchauffementScalarWhereInput | BlocEchauffementScalarWhereInput[]
  }

  export type EntrainementUncheckedUpdateManyWithoutEchauffementNestedInput = {
    create?: XOR<EntrainementCreateWithoutEchauffementInput, EntrainementUncheckedCreateWithoutEchauffementInput> | EntrainementCreateWithoutEchauffementInput[] | EntrainementUncheckedCreateWithoutEchauffementInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutEchauffementInput | EntrainementCreateOrConnectWithoutEchauffementInput[]
    upsert?: EntrainementUpsertWithWhereUniqueWithoutEchauffementInput | EntrainementUpsertWithWhereUniqueWithoutEchauffementInput[]
    createMany?: EntrainementCreateManyEchauffementInputEnvelope
    set?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    disconnect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    delete?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    update?: EntrainementUpdateWithWhereUniqueWithoutEchauffementInput | EntrainementUpdateWithWhereUniqueWithoutEchauffementInput[]
    updateMany?: EntrainementUpdateManyWithWhereWithoutEchauffementInput | EntrainementUpdateManyWithWhereWithoutEchauffementInput[]
    deleteMany?: EntrainementScalarWhereInput | EntrainementScalarWhereInput[]
  }

  export type EchauffementCreateNestedOneWithoutBlocsInput = {
    create?: XOR<EchauffementCreateWithoutBlocsInput, EchauffementUncheckedCreateWithoutBlocsInput>
    connectOrCreate?: EchauffementCreateOrConnectWithoutBlocsInput
    connect?: EchauffementWhereUniqueInput
  }

  export type EchauffementUpdateOneRequiredWithoutBlocsNestedInput = {
    create?: XOR<EchauffementCreateWithoutBlocsInput, EchauffementUncheckedCreateWithoutBlocsInput>
    connectOrCreate?: EchauffementCreateOrConnectWithoutBlocsInput
    upsert?: EchauffementUpsertWithoutBlocsInput
    connect?: EchauffementWhereUniqueInput
    update?: XOR<XOR<EchauffementUpdateToOneWithWhereWithoutBlocsInput, EchauffementUpdateWithoutBlocsInput>, EchauffementUncheckedUpdateWithoutBlocsInput>
  }

  export type TagCreateNestedManyWithoutSituationsMatchsInput = {
    create?: XOR<TagCreateWithoutSituationsMatchsInput, TagUncheckedCreateWithoutSituationsMatchsInput> | TagCreateWithoutSituationsMatchsInput[] | TagUncheckedCreateWithoutSituationsMatchsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutSituationsMatchsInput | TagCreateOrConnectWithoutSituationsMatchsInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type EntrainementCreateNestedManyWithoutSituationMatchInput = {
    create?: XOR<EntrainementCreateWithoutSituationMatchInput, EntrainementUncheckedCreateWithoutSituationMatchInput> | EntrainementCreateWithoutSituationMatchInput[] | EntrainementUncheckedCreateWithoutSituationMatchInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutSituationMatchInput | EntrainementCreateOrConnectWithoutSituationMatchInput[]
    createMany?: EntrainementCreateManySituationMatchInputEnvelope
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
  }

  export type TagUncheckedCreateNestedManyWithoutSituationsMatchsInput = {
    create?: XOR<TagCreateWithoutSituationsMatchsInput, TagUncheckedCreateWithoutSituationsMatchsInput> | TagCreateWithoutSituationsMatchsInput[] | TagUncheckedCreateWithoutSituationsMatchsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutSituationsMatchsInput | TagCreateOrConnectWithoutSituationsMatchsInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type EntrainementUncheckedCreateNestedManyWithoutSituationMatchInput = {
    create?: XOR<EntrainementCreateWithoutSituationMatchInput, EntrainementUncheckedCreateWithoutSituationMatchInput> | EntrainementCreateWithoutSituationMatchInput[] | EntrainementUncheckedCreateWithoutSituationMatchInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutSituationMatchInput | EntrainementCreateOrConnectWithoutSituationMatchInput[]
    createMany?: EntrainementCreateManySituationMatchInputEnvelope
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
  }

  export type TagUpdateManyWithoutSituationsMatchsNestedInput = {
    create?: XOR<TagCreateWithoutSituationsMatchsInput, TagUncheckedCreateWithoutSituationsMatchsInput> | TagCreateWithoutSituationsMatchsInput[] | TagUncheckedCreateWithoutSituationsMatchsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutSituationsMatchsInput | TagCreateOrConnectWithoutSituationsMatchsInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutSituationsMatchsInput | TagUpsertWithWhereUniqueWithoutSituationsMatchsInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutSituationsMatchsInput | TagUpdateWithWhereUniqueWithoutSituationsMatchsInput[]
    updateMany?: TagUpdateManyWithWhereWithoutSituationsMatchsInput | TagUpdateManyWithWhereWithoutSituationsMatchsInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type EntrainementUpdateManyWithoutSituationMatchNestedInput = {
    create?: XOR<EntrainementCreateWithoutSituationMatchInput, EntrainementUncheckedCreateWithoutSituationMatchInput> | EntrainementCreateWithoutSituationMatchInput[] | EntrainementUncheckedCreateWithoutSituationMatchInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutSituationMatchInput | EntrainementCreateOrConnectWithoutSituationMatchInput[]
    upsert?: EntrainementUpsertWithWhereUniqueWithoutSituationMatchInput | EntrainementUpsertWithWhereUniqueWithoutSituationMatchInput[]
    createMany?: EntrainementCreateManySituationMatchInputEnvelope
    set?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    disconnect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    delete?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    update?: EntrainementUpdateWithWhereUniqueWithoutSituationMatchInput | EntrainementUpdateWithWhereUniqueWithoutSituationMatchInput[]
    updateMany?: EntrainementUpdateManyWithWhereWithoutSituationMatchInput | EntrainementUpdateManyWithWhereWithoutSituationMatchInput[]
    deleteMany?: EntrainementScalarWhereInput | EntrainementScalarWhereInput[]
  }

  export type TagUncheckedUpdateManyWithoutSituationsMatchsNestedInput = {
    create?: XOR<TagCreateWithoutSituationsMatchsInput, TagUncheckedCreateWithoutSituationsMatchsInput> | TagCreateWithoutSituationsMatchsInput[] | TagUncheckedCreateWithoutSituationsMatchsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutSituationsMatchsInput | TagCreateOrConnectWithoutSituationsMatchsInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutSituationsMatchsInput | TagUpsertWithWhereUniqueWithoutSituationsMatchsInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutSituationsMatchsInput | TagUpdateWithWhereUniqueWithoutSituationsMatchsInput[]
    updateMany?: TagUpdateManyWithWhereWithoutSituationsMatchsInput | TagUpdateManyWithWhereWithoutSituationsMatchsInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type EntrainementUncheckedUpdateManyWithoutSituationMatchNestedInput = {
    create?: XOR<EntrainementCreateWithoutSituationMatchInput, EntrainementUncheckedCreateWithoutSituationMatchInput> | EntrainementCreateWithoutSituationMatchInput[] | EntrainementUncheckedCreateWithoutSituationMatchInput[]
    connectOrCreate?: EntrainementCreateOrConnectWithoutSituationMatchInput | EntrainementCreateOrConnectWithoutSituationMatchInput[]
    upsert?: EntrainementUpsertWithWhereUniqueWithoutSituationMatchInput | EntrainementUpsertWithWhereUniqueWithoutSituationMatchInput[]
    createMany?: EntrainementCreateManySituationMatchInputEnvelope
    set?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    disconnect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    delete?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    connect?: EntrainementWhereUniqueInput | EntrainementWhereUniqueInput[]
    update?: EntrainementUpdateWithWhereUniqueWithoutSituationMatchInput | EntrainementUpdateWithWhereUniqueWithoutSituationMatchInput[]
    updateMany?: EntrainementUpdateManyWithWhereWithoutSituationMatchInput | EntrainementUpdateManyWithWhereWithoutSituationMatchInput[]
    deleteMany?: EntrainementScalarWhereInput | EntrainementScalarWhereInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type TagCreateWithoutExercicesInput = {
    id?: string
    label: string
    category: string
    color?: string | null
    level?: number | null
    createdAt?: Date | string
    entrainements?: EntrainementCreateNestedManyWithoutTagsInput
    situationsMatchs?: SituationMatchCreateNestedManyWithoutTagsInput
  }

  export type TagUncheckedCreateWithoutExercicesInput = {
    id?: string
    label: string
    category: string
    color?: string | null
    level?: number | null
    createdAt?: Date | string
    entrainements?: EntrainementUncheckedCreateNestedManyWithoutTagsInput
    situationsMatchs?: SituationMatchUncheckedCreateNestedManyWithoutTagsInput
  }

  export type TagCreateOrConnectWithoutExercicesInput = {
    where: TagWhereUniqueInput
    create: XOR<TagCreateWithoutExercicesInput, TagUncheckedCreateWithoutExercicesInput>
  }

  export type EntrainementExerciceCreateWithoutExerciceInput = {
    id?: string
    ordre: number
    duree?: number | null
    notes?: string | null
    createdAt?: Date | string
    entrainement: EntrainementCreateNestedOneWithoutExercicesInput
  }

  export type EntrainementExerciceUncheckedCreateWithoutExerciceInput = {
    id?: string
    entrainementId: string
    ordre: number
    duree?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type EntrainementExerciceCreateOrConnectWithoutExerciceInput = {
    where: EntrainementExerciceWhereUniqueInput
    create: XOR<EntrainementExerciceCreateWithoutExerciceInput, EntrainementExerciceUncheckedCreateWithoutExerciceInput>
  }

  export type EntrainementExerciceCreateManyExerciceInputEnvelope = {
    data: EntrainementExerciceCreateManyExerciceInput | EntrainementExerciceCreateManyExerciceInput[]
    skipDuplicates?: boolean
  }

  export type TagUpsertWithWhereUniqueWithoutExercicesInput = {
    where: TagWhereUniqueInput
    update: XOR<TagUpdateWithoutExercicesInput, TagUncheckedUpdateWithoutExercicesInput>
    create: XOR<TagCreateWithoutExercicesInput, TagUncheckedCreateWithoutExercicesInput>
  }

  export type TagUpdateWithWhereUniqueWithoutExercicesInput = {
    where: TagWhereUniqueInput
    data: XOR<TagUpdateWithoutExercicesInput, TagUncheckedUpdateWithoutExercicesInput>
  }

  export type TagUpdateManyWithWhereWithoutExercicesInput = {
    where: TagScalarWhereInput
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyWithoutExercicesInput>
  }

  export type TagScalarWhereInput = {
    AND?: TagScalarWhereInput | TagScalarWhereInput[]
    OR?: TagScalarWhereInput[]
    NOT?: TagScalarWhereInput | TagScalarWhereInput[]
    id?: StringFilter<"Tag"> | string
    label?: StringFilter<"Tag"> | string
    category?: StringFilter<"Tag"> | string
    color?: StringNullableFilter<"Tag"> | string | null
    level?: IntNullableFilter<"Tag"> | number | null
    createdAt?: DateTimeFilter<"Tag"> | Date | string
  }

  export type EntrainementExerciceUpsertWithWhereUniqueWithoutExerciceInput = {
    where: EntrainementExerciceWhereUniqueInput
    update: XOR<EntrainementExerciceUpdateWithoutExerciceInput, EntrainementExerciceUncheckedUpdateWithoutExerciceInput>
    create: XOR<EntrainementExerciceCreateWithoutExerciceInput, EntrainementExerciceUncheckedCreateWithoutExerciceInput>
  }

  export type EntrainementExerciceUpdateWithWhereUniqueWithoutExerciceInput = {
    where: EntrainementExerciceWhereUniqueInput
    data: XOR<EntrainementExerciceUpdateWithoutExerciceInput, EntrainementExerciceUncheckedUpdateWithoutExerciceInput>
  }

  export type EntrainementExerciceUpdateManyWithWhereWithoutExerciceInput = {
    where: EntrainementExerciceScalarWhereInput
    data: XOR<EntrainementExerciceUpdateManyMutationInput, EntrainementExerciceUncheckedUpdateManyWithoutExerciceInput>
  }

  export type EntrainementExerciceScalarWhereInput = {
    AND?: EntrainementExerciceScalarWhereInput | EntrainementExerciceScalarWhereInput[]
    OR?: EntrainementExerciceScalarWhereInput[]
    NOT?: EntrainementExerciceScalarWhereInput | EntrainementExerciceScalarWhereInput[]
    id?: StringFilter<"EntrainementExercice"> | string
    entrainementId?: StringFilter<"EntrainementExercice"> | string
    exerciceId?: StringFilter<"EntrainementExercice"> | string
    ordre?: IntFilter<"EntrainementExercice"> | number
    duree?: IntNullableFilter<"EntrainementExercice"> | number | null
    notes?: StringNullableFilter<"EntrainementExercice"> | string | null
    createdAt?: DateTimeFilter<"EntrainementExercice"> | Date | string
  }

  export type ExerciceCreateWithoutTagsInput = {
    id?: string
    nom: string
    description: string
    imageUrl?: string | null
    schemaUrl?: string | null
    materiel?: string | null
    notes?: string | null
    variablesText?: string | null
    variablesPlus?: string | null
    variablesMinus?: string | null
    createdAt?: Date | string
    entrainements?: EntrainementExerciceCreateNestedManyWithoutExerciceInput
  }

  export type ExerciceUncheckedCreateWithoutTagsInput = {
    id?: string
    nom: string
    description: string
    imageUrl?: string | null
    schemaUrl?: string | null
    materiel?: string | null
    notes?: string | null
    variablesText?: string | null
    variablesPlus?: string | null
    variablesMinus?: string | null
    createdAt?: Date | string
    entrainements?: EntrainementExerciceUncheckedCreateNestedManyWithoutExerciceInput
  }

  export type ExerciceCreateOrConnectWithoutTagsInput = {
    where: ExerciceWhereUniqueInput
    create: XOR<ExerciceCreateWithoutTagsInput, ExerciceUncheckedCreateWithoutTagsInput>
  }

  export type EntrainementCreateWithoutTagsInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    exercices?: EntrainementExerciceCreateNestedManyWithoutEntrainementInput
    echauffement?: EchauffementCreateNestedOneWithoutEntrainementsInput
    situationMatch?: SituationMatchCreateNestedOneWithoutEntrainementsInput
  }

  export type EntrainementUncheckedCreateWithoutTagsInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    echauffementId?: string | null
    situationMatchId?: string | null
    exercices?: EntrainementExerciceUncheckedCreateNestedManyWithoutEntrainementInput
  }

  export type EntrainementCreateOrConnectWithoutTagsInput = {
    where: EntrainementWhereUniqueInput
    create: XOR<EntrainementCreateWithoutTagsInput, EntrainementUncheckedCreateWithoutTagsInput>
  }

  export type SituationMatchCreateWithoutTagsInput = {
    id?: string
    nom?: string | null
    type: string
    description?: string | null
    temps?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    entrainements?: EntrainementCreateNestedManyWithoutSituationMatchInput
  }

  export type SituationMatchUncheckedCreateWithoutTagsInput = {
    id?: string
    nom?: string | null
    type: string
    description?: string | null
    temps?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    entrainements?: EntrainementUncheckedCreateNestedManyWithoutSituationMatchInput
  }

  export type SituationMatchCreateOrConnectWithoutTagsInput = {
    where: SituationMatchWhereUniqueInput
    create: XOR<SituationMatchCreateWithoutTagsInput, SituationMatchUncheckedCreateWithoutTagsInput>
  }

  export type ExerciceUpsertWithWhereUniqueWithoutTagsInput = {
    where: ExerciceWhereUniqueInput
    update: XOR<ExerciceUpdateWithoutTagsInput, ExerciceUncheckedUpdateWithoutTagsInput>
    create: XOR<ExerciceCreateWithoutTagsInput, ExerciceUncheckedCreateWithoutTagsInput>
  }

  export type ExerciceUpdateWithWhereUniqueWithoutTagsInput = {
    where: ExerciceWhereUniqueInput
    data: XOR<ExerciceUpdateWithoutTagsInput, ExerciceUncheckedUpdateWithoutTagsInput>
  }

  export type ExerciceUpdateManyWithWhereWithoutTagsInput = {
    where: ExerciceScalarWhereInput
    data: XOR<ExerciceUpdateManyMutationInput, ExerciceUncheckedUpdateManyWithoutTagsInput>
  }

  export type ExerciceScalarWhereInput = {
    AND?: ExerciceScalarWhereInput | ExerciceScalarWhereInput[]
    OR?: ExerciceScalarWhereInput[]
    NOT?: ExerciceScalarWhereInput | ExerciceScalarWhereInput[]
    id?: StringFilter<"Exercice"> | string
    nom?: StringFilter<"Exercice"> | string
    description?: StringFilter<"Exercice"> | string
    imageUrl?: StringNullableFilter<"Exercice"> | string | null
    schemaUrl?: StringNullableFilter<"Exercice"> | string | null
    materiel?: StringNullableFilter<"Exercice"> | string | null
    notes?: StringNullableFilter<"Exercice"> | string | null
    variablesText?: StringNullableFilter<"Exercice"> | string | null
    variablesPlus?: StringNullableFilter<"Exercice"> | string | null
    variablesMinus?: StringNullableFilter<"Exercice"> | string | null
    createdAt?: DateTimeFilter<"Exercice"> | Date | string
  }

  export type EntrainementUpsertWithWhereUniqueWithoutTagsInput = {
    where: EntrainementWhereUniqueInput
    update: XOR<EntrainementUpdateWithoutTagsInput, EntrainementUncheckedUpdateWithoutTagsInput>
    create: XOR<EntrainementCreateWithoutTagsInput, EntrainementUncheckedCreateWithoutTagsInput>
  }

  export type EntrainementUpdateWithWhereUniqueWithoutTagsInput = {
    where: EntrainementWhereUniqueInput
    data: XOR<EntrainementUpdateWithoutTagsInput, EntrainementUncheckedUpdateWithoutTagsInput>
  }

  export type EntrainementUpdateManyWithWhereWithoutTagsInput = {
    where: EntrainementScalarWhereInput
    data: XOR<EntrainementUpdateManyMutationInput, EntrainementUncheckedUpdateManyWithoutTagsInput>
  }

  export type EntrainementScalarWhereInput = {
    AND?: EntrainementScalarWhereInput | EntrainementScalarWhereInput[]
    OR?: EntrainementScalarWhereInput[]
    NOT?: EntrainementScalarWhereInput | EntrainementScalarWhereInput[]
    id?: StringFilter<"Entrainement"> | string
    titre?: StringFilter<"Entrainement"> | string
    date?: DateTimeNullableFilter<"Entrainement"> | Date | string | null
    imageUrl?: StringNullableFilter<"Entrainement"> | string | null
    createdAt?: DateTimeFilter<"Entrainement"> | Date | string
    echauffementId?: StringNullableFilter<"Entrainement"> | string | null
    situationMatchId?: StringNullableFilter<"Entrainement"> | string | null
  }

  export type SituationMatchUpsertWithWhereUniqueWithoutTagsInput = {
    where: SituationMatchWhereUniqueInput
    update: XOR<SituationMatchUpdateWithoutTagsInput, SituationMatchUncheckedUpdateWithoutTagsInput>
    create: XOR<SituationMatchCreateWithoutTagsInput, SituationMatchUncheckedCreateWithoutTagsInput>
  }

  export type SituationMatchUpdateWithWhereUniqueWithoutTagsInput = {
    where: SituationMatchWhereUniqueInput
    data: XOR<SituationMatchUpdateWithoutTagsInput, SituationMatchUncheckedUpdateWithoutTagsInput>
  }

  export type SituationMatchUpdateManyWithWhereWithoutTagsInput = {
    where: SituationMatchScalarWhereInput
    data: XOR<SituationMatchUpdateManyMutationInput, SituationMatchUncheckedUpdateManyWithoutTagsInput>
  }

  export type SituationMatchScalarWhereInput = {
    AND?: SituationMatchScalarWhereInput | SituationMatchScalarWhereInput[]
    OR?: SituationMatchScalarWhereInput[]
    NOT?: SituationMatchScalarWhereInput | SituationMatchScalarWhereInput[]
    id?: StringFilter<"SituationMatch"> | string
    nom?: StringNullableFilter<"SituationMatch"> | string | null
    type?: StringFilter<"SituationMatch"> | string
    description?: StringNullableFilter<"SituationMatch"> | string | null
    temps?: StringNullableFilter<"SituationMatch"> | string | null
    imageUrl?: StringNullableFilter<"SituationMatch"> | string | null
    createdAt?: DateTimeFilter<"SituationMatch"> | Date | string
  }

  export type EntrainementExerciceCreateWithoutEntrainementInput = {
    id?: string
    ordre: number
    duree?: number | null
    notes?: string | null
    createdAt?: Date | string
    exercice: ExerciceCreateNestedOneWithoutEntrainementsInput
  }

  export type EntrainementExerciceUncheckedCreateWithoutEntrainementInput = {
    id?: string
    exerciceId: string
    ordre: number
    duree?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type EntrainementExerciceCreateOrConnectWithoutEntrainementInput = {
    where: EntrainementExerciceWhereUniqueInput
    create: XOR<EntrainementExerciceCreateWithoutEntrainementInput, EntrainementExerciceUncheckedCreateWithoutEntrainementInput>
  }

  export type EntrainementExerciceCreateManyEntrainementInputEnvelope = {
    data: EntrainementExerciceCreateManyEntrainementInput | EntrainementExerciceCreateManyEntrainementInput[]
    skipDuplicates?: boolean
  }

  export type TagCreateWithoutEntrainementsInput = {
    id?: string
    label: string
    category: string
    color?: string | null
    level?: number | null
    createdAt?: Date | string
    exercices?: ExerciceCreateNestedManyWithoutTagsInput
    situationsMatchs?: SituationMatchCreateNestedManyWithoutTagsInput
  }

  export type TagUncheckedCreateWithoutEntrainementsInput = {
    id?: string
    label: string
    category: string
    color?: string | null
    level?: number | null
    createdAt?: Date | string
    exercices?: ExerciceUncheckedCreateNestedManyWithoutTagsInput
    situationsMatchs?: SituationMatchUncheckedCreateNestedManyWithoutTagsInput
  }

  export type TagCreateOrConnectWithoutEntrainementsInput = {
    where: TagWhereUniqueInput
    create: XOR<TagCreateWithoutEntrainementsInput, TagUncheckedCreateWithoutEntrainementsInput>
  }

  export type EchauffementCreateWithoutEntrainementsInput = {
    id?: string
    nom: string
    description?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    blocs?: BlocEchauffementCreateNestedManyWithoutEchauffementInput
  }

  export type EchauffementUncheckedCreateWithoutEntrainementsInput = {
    id?: string
    nom: string
    description?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    blocs?: BlocEchauffementUncheckedCreateNestedManyWithoutEchauffementInput
  }

  export type EchauffementCreateOrConnectWithoutEntrainementsInput = {
    where: EchauffementWhereUniqueInput
    create: XOR<EchauffementCreateWithoutEntrainementsInput, EchauffementUncheckedCreateWithoutEntrainementsInput>
  }

  export type SituationMatchCreateWithoutEntrainementsInput = {
    id?: string
    nom?: string | null
    type: string
    description?: string | null
    temps?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    tags?: TagCreateNestedManyWithoutSituationsMatchsInput
  }

  export type SituationMatchUncheckedCreateWithoutEntrainementsInput = {
    id?: string
    nom?: string | null
    type: string
    description?: string | null
    temps?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    tags?: TagUncheckedCreateNestedManyWithoutSituationsMatchsInput
  }

  export type SituationMatchCreateOrConnectWithoutEntrainementsInput = {
    where: SituationMatchWhereUniqueInput
    create: XOR<SituationMatchCreateWithoutEntrainementsInput, SituationMatchUncheckedCreateWithoutEntrainementsInput>
  }

  export type EntrainementExerciceUpsertWithWhereUniqueWithoutEntrainementInput = {
    where: EntrainementExerciceWhereUniqueInput
    update: XOR<EntrainementExerciceUpdateWithoutEntrainementInput, EntrainementExerciceUncheckedUpdateWithoutEntrainementInput>
    create: XOR<EntrainementExerciceCreateWithoutEntrainementInput, EntrainementExerciceUncheckedCreateWithoutEntrainementInput>
  }

  export type EntrainementExerciceUpdateWithWhereUniqueWithoutEntrainementInput = {
    where: EntrainementExerciceWhereUniqueInput
    data: XOR<EntrainementExerciceUpdateWithoutEntrainementInput, EntrainementExerciceUncheckedUpdateWithoutEntrainementInput>
  }

  export type EntrainementExerciceUpdateManyWithWhereWithoutEntrainementInput = {
    where: EntrainementExerciceScalarWhereInput
    data: XOR<EntrainementExerciceUpdateManyMutationInput, EntrainementExerciceUncheckedUpdateManyWithoutEntrainementInput>
  }

  export type TagUpsertWithWhereUniqueWithoutEntrainementsInput = {
    where: TagWhereUniqueInput
    update: XOR<TagUpdateWithoutEntrainementsInput, TagUncheckedUpdateWithoutEntrainementsInput>
    create: XOR<TagCreateWithoutEntrainementsInput, TagUncheckedCreateWithoutEntrainementsInput>
  }

  export type TagUpdateWithWhereUniqueWithoutEntrainementsInput = {
    where: TagWhereUniqueInput
    data: XOR<TagUpdateWithoutEntrainementsInput, TagUncheckedUpdateWithoutEntrainementsInput>
  }

  export type TagUpdateManyWithWhereWithoutEntrainementsInput = {
    where: TagScalarWhereInput
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyWithoutEntrainementsInput>
  }

  export type EchauffementUpsertWithoutEntrainementsInput = {
    update: XOR<EchauffementUpdateWithoutEntrainementsInput, EchauffementUncheckedUpdateWithoutEntrainementsInput>
    create: XOR<EchauffementCreateWithoutEntrainementsInput, EchauffementUncheckedCreateWithoutEntrainementsInput>
    where?: EchauffementWhereInput
  }

  export type EchauffementUpdateToOneWithWhereWithoutEntrainementsInput = {
    where?: EchauffementWhereInput
    data: XOR<EchauffementUpdateWithoutEntrainementsInput, EchauffementUncheckedUpdateWithoutEntrainementsInput>
  }

  export type EchauffementUpdateWithoutEntrainementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    blocs?: BlocEchauffementUpdateManyWithoutEchauffementNestedInput
  }

  export type EchauffementUncheckedUpdateWithoutEntrainementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    blocs?: BlocEchauffementUncheckedUpdateManyWithoutEchauffementNestedInput
  }

  export type SituationMatchUpsertWithoutEntrainementsInput = {
    update: XOR<SituationMatchUpdateWithoutEntrainementsInput, SituationMatchUncheckedUpdateWithoutEntrainementsInput>
    create: XOR<SituationMatchCreateWithoutEntrainementsInput, SituationMatchUncheckedCreateWithoutEntrainementsInput>
    where?: SituationMatchWhereInput
  }

  export type SituationMatchUpdateToOneWithWhereWithoutEntrainementsInput = {
    where?: SituationMatchWhereInput
    data: XOR<SituationMatchUpdateWithoutEntrainementsInput, SituationMatchUncheckedUpdateWithoutEntrainementsInput>
  }

  export type SituationMatchUpdateWithoutEntrainementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUpdateManyWithoutSituationsMatchsNestedInput
  }

  export type SituationMatchUncheckedUpdateWithoutEntrainementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUncheckedUpdateManyWithoutSituationsMatchsNestedInput
  }

  export type EntrainementCreateWithoutExercicesInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    tags?: TagCreateNestedManyWithoutEntrainementsInput
    echauffement?: EchauffementCreateNestedOneWithoutEntrainementsInput
    situationMatch?: SituationMatchCreateNestedOneWithoutEntrainementsInput
  }

  export type EntrainementUncheckedCreateWithoutExercicesInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    echauffementId?: string | null
    situationMatchId?: string | null
    tags?: TagUncheckedCreateNestedManyWithoutEntrainementsInput
  }

  export type EntrainementCreateOrConnectWithoutExercicesInput = {
    where: EntrainementWhereUniqueInput
    create: XOR<EntrainementCreateWithoutExercicesInput, EntrainementUncheckedCreateWithoutExercicesInput>
  }

  export type ExerciceCreateWithoutEntrainementsInput = {
    id?: string
    nom: string
    description: string
    imageUrl?: string | null
    schemaUrl?: string | null
    materiel?: string | null
    notes?: string | null
    variablesText?: string | null
    variablesPlus?: string | null
    variablesMinus?: string | null
    createdAt?: Date | string
    tags?: TagCreateNestedManyWithoutExercicesInput
  }

  export type ExerciceUncheckedCreateWithoutEntrainementsInput = {
    id?: string
    nom: string
    description: string
    imageUrl?: string | null
    schemaUrl?: string | null
    materiel?: string | null
    notes?: string | null
    variablesText?: string | null
    variablesPlus?: string | null
    variablesMinus?: string | null
    createdAt?: Date | string
    tags?: TagUncheckedCreateNestedManyWithoutExercicesInput
  }

  export type ExerciceCreateOrConnectWithoutEntrainementsInput = {
    where: ExerciceWhereUniqueInput
    create: XOR<ExerciceCreateWithoutEntrainementsInput, ExerciceUncheckedCreateWithoutEntrainementsInput>
  }

  export type EntrainementUpsertWithoutExercicesInput = {
    update: XOR<EntrainementUpdateWithoutExercicesInput, EntrainementUncheckedUpdateWithoutExercicesInput>
    create: XOR<EntrainementCreateWithoutExercicesInput, EntrainementUncheckedCreateWithoutExercicesInput>
    where?: EntrainementWhereInput
  }

  export type EntrainementUpdateToOneWithWhereWithoutExercicesInput = {
    where?: EntrainementWhereInput
    data: XOR<EntrainementUpdateWithoutExercicesInput, EntrainementUncheckedUpdateWithoutExercicesInput>
  }

  export type EntrainementUpdateWithoutExercicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUpdateManyWithoutEntrainementsNestedInput
    echauffement?: EchauffementUpdateOneWithoutEntrainementsNestedInput
    situationMatch?: SituationMatchUpdateOneWithoutEntrainementsNestedInput
  }

  export type EntrainementUncheckedUpdateWithoutExercicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    echauffementId?: NullableStringFieldUpdateOperationsInput | string | null
    situationMatchId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TagUncheckedUpdateManyWithoutEntrainementsNestedInput
  }

  export type ExerciceUpsertWithoutEntrainementsInput = {
    update: XOR<ExerciceUpdateWithoutEntrainementsInput, ExerciceUncheckedUpdateWithoutEntrainementsInput>
    create: XOR<ExerciceCreateWithoutEntrainementsInput, ExerciceUncheckedCreateWithoutEntrainementsInput>
    where?: ExerciceWhereInput
  }

  export type ExerciceUpdateToOneWithWhereWithoutEntrainementsInput = {
    where?: ExerciceWhereInput
    data: XOR<ExerciceUpdateWithoutEntrainementsInput, ExerciceUncheckedUpdateWithoutEntrainementsInput>
  }

  export type ExerciceUpdateWithoutEntrainementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    schemaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    materiel?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    variablesText?: NullableStringFieldUpdateOperationsInput | string | null
    variablesPlus?: NullableStringFieldUpdateOperationsInput | string | null
    variablesMinus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUpdateManyWithoutExercicesNestedInput
  }

  export type ExerciceUncheckedUpdateWithoutEntrainementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    schemaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    materiel?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    variablesText?: NullableStringFieldUpdateOperationsInput | string | null
    variablesPlus?: NullableStringFieldUpdateOperationsInput | string | null
    variablesMinus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: TagUncheckedUpdateManyWithoutExercicesNestedInput
  }

  export type BlocEchauffementCreateWithoutEchauffementInput = {
    id?: string
    ordre: number
    titre: string
    repetitions?: string | null
    temps?: string | null
    informations?: string | null
    fonctionnement?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type BlocEchauffementUncheckedCreateWithoutEchauffementInput = {
    id?: string
    ordre: number
    titre: string
    repetitions?: string | null
    temps?: string | null
    informations?: string | null
    fonctionnement?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type BlocEchauffementCreateOrConnectWithoutEchauffementInput = {
    where: BlocEchauffementWhereUniqueInput
    create: XOR<BlocEchauffementCreateWithoutEchauffementInput, BlocEchauffementUncheckedCreateWithoutEchauffementInput>
  }

  export type BlocEchauffementCreateManyEchauffementInputEnvelope = {
    data: BlocEchauffementCreateManyEchauffementInput | BlocEchauffementCreateManyEchauffementInput[]
    skipDuplicates?: boolean
  }

  export type EntrainementCreateWithoutEchauffementInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    exercices?: EntrainementExerciceCreateNestedManyWithoutEntrainementInput
    tags?: TagCreateNestedManyWithoutEntrainementsInput
    situationMatch?: SituationMatchCreateNestedOneWithoutEntrainementsInput
  }

  export type EntrainementUncheckedCreateWithoutEchauffementInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    situationMatchId?: string | null
    exercices?: EntrainementExerciceUncheckedCreateNestedManyWithoutEntrainementInput
    tags?: TagUncheckedCreateNestedManyWithoutEntrainementsInput
  }

  export type EntrainementCreateOrConnectWithoutEchauffementInput = {
    where: EntrainementWhereUniqueInput
    create: XOR<EntrainementCreateWithoutEchauffementInput, EntrainementUncheckedCreateWithoutEchauffementInput>
  }

  export type EntrainementCreateManyEchauffementInputEnvelope = {
    data: EntrainementCreateManyEchauffementInput | EntrainementCreateManyEchauffementInput[]
    skipDuplicates?: boolean
  }

  export type BlocEchauffementUpsertWithWhereUniqueWithoutEchauffementInput = {
    where: BlocEchauffementWhereUniqueInput
    update: XOR<BlocEchauffementUpdateWithoutEchauffementInput, BlocEchauffementUncheckedUpdateWithoutEchauffementInput>
    create: XOR<BlocEchauffementCreateWithoutEchauffementInput, BlocEchauffementUncheckedCreateWithoutEchauffementInput>
  }

  export type BlocEchauffementUpdateWithWhereUniqueWithoutEchauffementInput = {
    where: BlocEchauffementWhereUniqueInput
    data: XOR<BlocEchauffementUpdateWithoutEchauffementInput, BlocEchauffementUncheckedUpdateWithoutEchauffementInput>
  }

  export type BlocEchauffementUpdateManyWithWhereWithoutEchauffementInput = {
    where: BlocEchauffementScalarWhereInput
    data: XOR<BlocEchauffementUpdateManyMutationInput, BlocEchauffementUncheckedUpdateManyWithoutEchauffementInput>
  }

  export type BlocEchauffementScalarWhereInput = {
    AND?: BlocEchauffementScalarWhereInput | BlocEchauffementScalarWhereInput[]
    OR?: BlocEchauffementScalarWhereInput[]
    NOT?: BlocEchauffementScalarWhereInput | BlocEchauffementScalarWhereInput[]
    id?: StringFilter<"BlocEchauffement"> | string
    echauffementId?: StringFilter<"BlocEchauffement"> | string
    ordre?: IntFilter<"BlocEchauffement"> | number
    titre?: StringFilter<"BlocEchauffement"> | string
    repetitions?: StringNullableFilter<"BlocEchauffement"> | string | null
    temps?: StringNullableFilter<"BlocEchauffement"> | string | null
    informations?: StringNullableFilter<"BlocEchauffement"> | string | null
    fonctionnement?: StringNullableFilter<"BlocEchauffement"> | string | null
    notes?: StringNullableFilter<"BlocEchauffement"> | string | null
    createdAt?: DateTimeFilter<"BlocEchauffement"> | Date | string
  }

  export type EntrainementUpsertWithWhereUniqueWithoutEchauffementInput = {
    where: EntrainementWhereUniqueInput
    update: XOR<EntrainementUpdateWithoutEchauffementInput, EntrainementUncheckedUpdateWithoutEchauffementInput>
    create: XOR<EntrainementCreateWithoutEchauffementInput, EntrainementUncheckedCreateWithoutEchauffementInput>
  }

  export type EntrainementUpdateWithWhereUniqueWithoutEchauffementInput = {
    where: EntrainementWhereUniqueInput
    data: XOR<EntrainementUpdateWithoutEchauffementInput, EntrainementUncheckedUpdateWithoutEchauffementInput>
  }

  export type EntrainementUpdateManyWithWhereWithoutEchauffementInput = {
    where: EntrainementScalarWhereInput
    data: XOR<EntrainementUpdateManyMutationInput, EntrainementUncheckedUpdateManyWithoutEchauffementInput>
  }

  export type EchauffementCreateWithoutBlocsInput = {
    id?: string
    nom: string
    description?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    entrainements?: EntrainementCreateNestedManyWithoutEchauffementInput
  }

  export type EchauffementUncheckedCreateWithoutBlocsInput = {
    id?: string
    nom: string
    description?: string | null
    imageUrl?: string | null
    createdAt?: Date | string
    entrainements?: EntrainementUncheckedCreateNestedManyWithoutEchauffementInput
  }

  export type EchauffementCreateOrConnectWithoutBlocsInput = {
    where: EchauffementWhereUniqueInput
    create: XOR<EchauffementCreateWithoutBlocsInput, EchauffementUncheckedCreateWithoutBlocsInput>
  }

  export type EchauffementUpsertWithoutBlocsInput = {
    update: XOR<EchauffementUpdateWithoutBlocsInput, EchauffementUncheckedUpdateWithoutBlocsInput>
    create: XOR<EchauffementCreateWithoutBlocsInput, EchauffementUncheckedCreateWithoutBlocsInput>
    where?: EchauffementWhereInput
  }

  export type EchauffementUpdateToOneWithWhereWithoutBlocsInput = {
    where?: EchauffementWhereInput
    data: XOR<EchauffementUpdateWithoutBlocsInput, EchauffementUncheckedUpdateWithoutBlocsInput>
  }

  export type EchauffementUpdateWithoutBlocsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainements?: EntrainementUpdateManyWithoutEchauffementNestedInput
  }

  export type EchauffementUncheckedUpdateWithoutBlocsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainements?: EntrainementUncheckedUpdateManyWithoutEchauffementNestedInput
  }

  export type TagCreateWithoutSituationsMatchsInput = {
    id?: string
    label: string
    category: string
    color?: string | null
    level?: number | null
    createdAt?: Date | string
    exercices?: ExerciceCreateNestedManyWithoutTagsInput
    entrainements?: EntrainementCreateNestedManyWithoutTagsInput
  }

  export type TagUncheckedCreateWithoutSituationsMatchsInput = {
    id?: string
    label: string
    category: string
    color?: string | null
    level?: number | null
    createdAt?: Date | string
    exercices?: ExerciceUncheckedCreateNestedManyWithoutTagsInput
    entrainements?: EntrainementUncheckedCreateNestedManyWithoutTagsInput
  }

  export type TagCreateOrConnectWithoutSituationsMatchsInput = {
    where: TagWhereUniqueInput
    create: XOR<TagCreateWithoutSituationsMatchsInput, TagUncheckedCreateWithoutSituationsMatchsInput>
  }

  export type EntrainementCreateWithoutSituationMatchInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    exercices?: EntrainementExerciceCreateNestedManyWithoutEntrainementInput
    tags?: TagCreateNestedManyWithoutEntrainementsInput
    echauffement?: EchauffementCreateNestedOneWithoutEntrainementsInput
  }

  export type EntrainementUncheckedCreateWithoutSituationMatchInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    echauffementId?: string | null
    exercices?: EntrainementExerciceUncheckedCreateNestedManyWithoutEntrainementInput
    tags?: TagUncheckedCreateNestedManyWithoutEntrainementsInput
  }

  export type EntrainementCreateOrConnectWithoutSituationMatchInput = {
    where: EntrainementWhereUniqueInput
    create: XOR<EntrainementCreateWithoutSituationMatchInput, EntrainementUncheckedCreateWithoutSituationMatchInput>
  }

  export type EntrainementCreateManySituationMatchInputEnvelope = {
    data: EntrainementCreateManySituationMatchInput | EntrainementCreateManySituationMatchInput[]
    skipDuplicates?: boolean
  }

  export type TagUpsertWithWhereUniqueWithoutSituationsMatchsInput = {
    where: TagWhereUniqueInput
    update: XOR<TagUpdateWithoutSituationsMatchsInput, TagUncheckedUpdateWithoutSituationsMatchsInput>
    create: XOR<TagCreateWithoutSituationsMatchsInput, TagUncheckedCreateWithoutSituationsMatchsInput>
  }

  export type TagUpdateWithWhereUniqueWithoutSituationsMatchsInput = {
    where: TagWhereUniqueInput
    data: XOR<TagUpdateWithoutSituationsMatchsInput, TagUncheckedUpdateWithoutSituationsMatchsInput>
  }

  export type TagUpdateManyWithWhereWithoutSituationsMatchsInput = {
    where: TagScalarWhereInput
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyWithoutSituationsMatchsInput>
  }

  export type EntrainementUpsertWithWhereUniqueWithoutSituationMatchInput = {
    where: EntrainementWhereUniqueInput
    update: XOR<EntrainementUpdateWithoutSituationMatchInput, EntrainementUncheckedUpdateWithoutSituationMatchInput>
    create: XOR<EntrainementCreateWithoutSituationMatchInput, EntrainementUncheckedCreateWithoutSituationMatchInput>
  }

  export type EntrainementUpdateWithWhereUniqueWithoutSituationMatchInput = {
    where: EntrainementWhereUniqueInput
    data: XOR<EntrainementUpdateWithoutSituationMatchInput, EntrainementUncheckedUpdateWithoutSituationMatchInput>
  }

  export type EntrainementUpdateManyWithWhereWithoutSituationMatchInput = {
    where: EntrainementScalarWhereInput
    data: XOR<EntrainementUpdateManyMutationInput, EntrainementUncheckedUpdateManyWithoutSituationMatchInput>
  }

  export type EntrainementExerciceCreateManyExerciceInput = {
    id?: string
    entrainementId: string
    ordre: number
    duree?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type TagUpdateWithoutExercicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainements?: EntrainementUpdateManyWithoutTagsNestedInput
    situationsMatchs?: SituationMatchUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateWithoutExercicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainements?: EntrainementUncheckedUpdateManyWithoutTagsNestedInput
    situationsMatchs?: SituationMatchUncheckedUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateManyWithoutExercicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementExerciceUpdateWithoutExerciceInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainement?: EntrainementUpdateOneRequiredWithoutExercicesNestedInput
  }

  export type EntrainementExerciceUncheckedUpdateWithoutExerciceInput = {
    id?: StringFieldUpdateOperationsInput | string
    entrainementId?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementExerciceUncheckedUpdateManyWithoutExerciceInput = {
    id?: StringFieldUpdateOperationsInput | string
    entrainementId?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExerciceUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    schemaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    materiel?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    variablesText?: NullableStringFieldUpdateOperationsInput | string | null
    variablesPlus?: NullableStringFieldUpdateOperationsInput | string | null
    variablesMinus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainements?: EntrainementExerciceUpdateManyWithoutExerciceNestedInput
  }

  export type ExerciceUncheckedUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    schemaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    materiel?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    variablesText?: NullableStringFieldUpdateOperationsInput | string | null
    variablesPlus?: NullableStringFieldUpdateOperationsInput | string | null
    variablesMinus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainements?: EntrainementExerciceUncheckedUpdateManyWithoutExerciceNestedInput
  }

  export type ExerciceUncheckedUpdateManyWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    schemaUrl?: NullableStringFieldUpdateOperationsInput | string | null
    materiel?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    variablesText?: NullableStringFieldUpdateOperationsInput | string | null
    variablesPlus?: NullableStringFieldUpdateOperationsInput | string | null
    variablesMinus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: EntrainementExerciceUpdateManyWithoutEntrainementNestedInput
    echauffement?: EchauffementUpdateOneWithoutEntrainementsNestedInput
    situationMatch?: SituationMatchUpdateOneWithoutEntrainementsNestedInput
  }

  export type EntrainementUncheckedUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    echauffementId?: NullableStringFieldUpdateOperationsInput | string | null
    situationMatchId?: NullableStringFieldUpdateOperationsInput | string | null
    exercices?: EntrainementExerciceUncheckedUpdateManyWithoutEntrainementNestedInput
  }

  export type EntrainementUncheckedUpdateManyWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    echauffementId?: NullableStringFieldUpdateOperationsInput | string | null
    situationMatchId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SituationMatchUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainements?: EntrainementUpdateManyWithoutSituationMatchNestedInput
  }

  export type SituationMatchUncheckedUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entrainements?: EntrainementUncheckedUpdateManyWithoutSituationMatchNestedInput
  }

  export type SituationMatchUncheckedUpdateManyWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementExerciceCreateManyEntrainementInput = {
    id?: string
    exerciceId: string
    ordre: number
    duree?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type EntrainementExerciceUpdateWithoutEntrainementInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercice?: ExerciceUpdateOneRequiredWithoutEntrainementsNestedInput
  }

  export type EntrainementExerciceUncheckedUpdateWithoutEntrainementInput = {
    id?: StringFieldUpdateOperationsInput | string
    exerciceId?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementExerciceUncheckedUpdateManyWithoutEntrainementInput = {
    id?: StringFieldUpdateOperationsInput | string
    exerciceId?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    duree?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TagUpdateWithoutEntrainementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: ExerciceUpdateManyWithoutTagsNestedInput
    situationsMatchs?: SituationMatchUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateWithoutEntrainementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: ExerciceUncheckedUpdateManyWithoutTagsNestedInput
    situationsMatchs?: SituationMatchUncheckedUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateManyWithoutEntrainementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlocEchauffementCreateManyEchauffementInput = {
    id?: string
    ordre: number
    titre: string
    repetitions?: string | null
    temps?: string | null
    informations?: string | null
    fonctionnement?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type EntrainementCreateManyEchauffementInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    situationMatchId?: string | null
  }

  export type BlocEchauffementUpdateWithoutEchauffementInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    titre?: StringFieldUpdateOperationsInput | string
    repetitions?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    informations?: NullableStringFieldUpdateOperationsInput | string | null
    fonctionnement?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlocEchauffementUncheckedUpdateWithoutEchauffementInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    titre?: StringFieldUpdateOperationsInput | string
    repetitions?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    informations?: NullableStringFieldUpdateOperationsInput | string | null
    fonctionnement?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlocEchauffementUncheckedUpdateManyWithoutEchauffementInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordre?: IntFieldUpdateOperationsInput | number
    titre?: StringFieldUpdateOperationsInput | string
    repetitions?: NullableStringFieldUpdateOperationsInput | string | null
    temps?: NullableStringFieldUpdateOperationsInput | string | null
    informations?: NullableStringFieldUpdateOperationsInput | string | null
    fonctionnement?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementUpdateWithoutEchauffementInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: EntrainementExerciceUpdateManyWithoutEntrainementNestedInput
    tags?: TagUpdateManyWithoutEntrainementsNestedInput
    situationMatch?: SituationMatchUpdateOneWithoutEntrainementsNestedInput
  }

  export type EntrainementUncheckedUpdateWithoutEchauffementInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    situationMatchId?: NullableStringFieldUpdateOperationsInput | string | null
    exercices?: EntrainementExerciceUncheckedUpdateManyWithoutEntrainementNestedInput
    tags?: TagUncheckedUpdateManyWithoutEntrainementsNestedInput
  }

  export type EntrainementUncheckedUpdateManyWithoutEchauffementInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    situationMatchId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type EntrainementCreateManySituationMatchInput = {
    id?: string
    titre: string
    date?: Date | string | null
    imageUrl?: string | null
    createdAt?: Date | string
    echauffementId?: string | null
  }

  export type TagUpdateWithoutSituationsMatchsInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: ExerciceUpdateManyWithoutTagsNestedInput
    entrainements?: EntrainementUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateWithoutSituationsMatchsInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: ExerciceUncheckedUpdateManyWithoutTagsNestedInput
    entrainements?: EntrainementUncheckedUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateManyWithoutSituationsMatchsInput = {
    id?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EntrainementUpdateWithoutSituationMatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exercices?: EntrainementExerciceUpdateManyWithoutEntrainementNestedInput
    tags?: TagUpdateManyWithoutEntrainementsNestedInput
    echauffement?: EchauffementUpdateOneWithoutEntrainementsNestedInput
  }

  export type EntrainementUncheckedUpdateWithoutSituationMatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    echauffementId?: NullableStringFieldUpdateOperationsInput | string | null
    exercices?: EntrainementExerciceUncheckedUpdateManyWithoutEntrainementNestedInput
    tags?: TagUncheckedUpdateManyWithoutEntrainementsNestedInput
  }

  export type EntrainementUncheckedUpdateManyWithoutSituationMatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    titre?: StringFieldUpdateOperationsInput | string
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    echauffementId?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ExerciceCountOutputTypeDefaultArgs instead
     */
    export type ExerciceCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExerciceCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TagCountOutputTypeDefaultArgs instead
     */
    export type TagCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TagCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EntrainementCountOutputTypeDefaultArgs instead
     */
    export type EntrainementCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EntrainementCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EchauffementCountOutputTypeDefaultArgs instead
     */
    export type EchauffementCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EchauffementCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SituationMatchCountOutputTypeDefaultArgs instead
     */
    export type SituationMatchCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SituationMatchCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ExerciceDefaultArgs instead
     */
    export type ExerciceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExerciceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TagDefaultArgs instead
     */
    export type TagArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TagDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EntrainementDefaultArgs instead
     */
    export type EntrainementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EntrainementDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EntrainementExerciceDefaultArgs instead
     */
    export type EntrainementExerciceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EntrainementExerciceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EchauffementDefaultArgs instead
     */
    export type EchauffementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EchauffementDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BlocEchauffementDefaultArgs instead
     */
    export type BlocEchauffementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BlocEchauffementDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SituationMatchDefaultArgs instead
     */
    export type SituationMatchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SituationMatchDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}