# Goldwise

## AI-Powered Gold Investment Intelligence and Decision-Support Platform

**Selected direction --- Option A**

Goldwise is a data-driven investment intelligence platform focused on
helping Indian retail investors understand, compare, and evaluate gold
investment products. It brings together market information, historical
performance, risk measures, product-level comparisons, investment
simulations, and an evidence-grounded AI assistant in one place.

**Product principle:** The dashboard and analytical tools are the core
of Goldwise. Gemini is an additional conversational interface that helps
users interpret the data and explore decisions; it is not the product
itself and must not replace the underlying analytics.

------------------------------------------------------------------------

# 1. Project Overview

Gold is a widely considered investment asset in India, but investors
encounter several different ways to gain exposure to it. These include
Sovereign Gold Bonds (SGBs), Gold Exchange-Traded Funds (ETFs), and Gold
Fund of Funds (FoFs). Although these products are linked to gold, they
differ in structure, costs, liquidity, taxation, maturity or exit
conditions, tracking behaviour, and the way investors buy and hold them.

Information about these products is spread across exchanges, fund
houses, government announcements, market-data platforms, and factsheets.
Investors may need to visit multiple sources and manually calculate
returns or compare risk before making a decision.

Goldwise aims to reduce this fragmentation through a unified platform
that presents relevant information in a consistent format. It combines:

-   A gold-market overview.
-   A searchable product explorer.
-   Historical performance analysis.
-   Side-by-side product comparison.
-   Risk and return analytics.
-   An investment simulator.
-   Preference-based decision support.
-   A Gemini-powered assistant grounded in Goldwise data and trusted
    source material.

The platform is intended for educational and analytical decision
support. It should help users understand trade-offs, not promise returns
or make unsupported claims that one product is universally best.

# 2. Problem Statement

Indian retail investors who want exposure to gold can choose among
multiple investment products, including Sovereign Gold Bonds, Gold ETFs,
and Gold Fund of Funds. However, information about these products is
distributed across different official websites, exchanges, asset
management companies, factsheets, and market-data providers. The
products also have different structures, costs, liquidity
characteristics, holding periods, and exit conditions, making direct
comparison difficult.

Investors often lack a unified way to examine historical performance,
compare risk and return, understand product-specific features, and
estimate how an investment could behave under different contribution or
holding-period scenarios. Generic financial information and
conversational AI tools may provide explanations, but without reliable,
current, traceable product data they can produce incomplete or
misleading comparisons.

**Goldwise addresses this problem by developing a unified, data-driven
gold investment intelligence and decision-support platform for Indian
retail investors. It will aggregate and standardize information on SGBs,
Gold ETFs, and Gold FoFs; provide historical performance and risk
analytics; enable side-by-side comparisons and investment simulations;
and offer an AI assistant that answers questions using verified platform
data and cited source material.**

# 3. Project Direction and Product Philosophy

## 3.1 The chosen direction

Goldwise should be developed as an **investment intelligence dashboard
with an AI-assisted decision-support layer**.

The product has two complementary parts:

1.  **Analytical platform --- the foundation:** structured product data,
    market overview, historical analysis, comparisons, risk metrics, and
    simulations.
2.  **Gemini assistant --- the interpretation layer:** natural-language
    explanations, answers to product questions, summaries of
    comparisons, and help interpreting the dashboard.

The assistant must use the same underlying data and documented sources
as the dashboard. It should not independently invent prices, returns,
product terms, tax rules, or investment recommendations.

## 3.2 What Goldwise is not

-   It is not merely a chatbot that gives generic gold-investment
    advice.
-   It is not a trading platform or brokerage.
-   It is not a platform for executing purchases or selling investments.
-   It is not a return-guarantee or price-prediction product.
-   It should not rank products using historical return alone.
-   It should not present simulated outcomes as guaranteed future
    performance.

## 3.3 Main questions Goldwise should help answer

-   What gold investment products are available in the platform's
    coverage?
-   How do SGBs, Gold ETFs, and Gold FoFs differ?
-   How has each product performed over different historical periods?
-   What are the CAGR, volatility, drawdown, and other relevant
    risk/return measures?
-   How closely has a product tracked the underlying gold benchmark?
-   What costs, liquidity constraints, maturity conditions, and
    product-specific considerations should an investor understand?
-   How would a hypothetical lump-sum or recurring investment have
    performed over a selected historical period?
-   Which products best match a user's stated preferences and
    constraints?
-   What are the trade-offs between a product that has higher historical
    returns and one that has lower volatility or costs?
-   What evidence supports the assistant's explanation?

# 4. Target Users

The primary target users are Indian retail investors and individuals who
are learning about gold as an investment.

### User groups

1.  **First-time investors:** need clear explanations of the available
    gold investment routes and their differences.
2.  **Existing gold investors:** want to compare products and review
    historical performance.
3.  **Research-oriented investors:** want metrics, charts, product-level
    data, and source transparency.
4.  **Preference-driven investors:** want to filter products based on
    holding period, liquidity needs, risk tolerance, investment amount,
    and other stated preferences.
5.  **Students and financial learners:** want to understand how gold
    investment products and their performance measures work.

The interface should make technical financial metrics understandable
without hiding the underlying calculations or assumptions.

# 5. Product Scope and Core Modules

## Module 1: Gold Market Overview

The overview page gives users a quick picture of the gold market and the
products covered by Goldwise.

### Potential contents

-   Latest available gold benchmark price.
-   Benchmark price movement over selected periods.
-   Historical gold price chart.
-   Number of SGBs, ETFs, and FoFs covered in the database.
-   Broad category-level performance summaries.
-   Top and bottom performers over a selected period, with sufficient
    data-coverage warnings.
-   Market context and relevant source-linked updates, where reliable
    feeds are available.

### Important implementation notes

-   Every displayed price must show its date/time and source.
-   Do not label delayed or end-of-day data as live.
-   Distinguish the underlying gold benchmark from the market price or
    NAV of an investment product.
-   Category-level summaries should state how products were selected and
    aggregated.

**Output:** A concise, source-aware overview of the gold market and the
instruments covered.

## Module 2: Product Explorer

The explorer allows users to discover and inspect individual gold
investment products.

### Categories

-   Sovereign Gold Bonds (SGBs).
-   Gold Exchange-Traded Funds (ETFs).
-   Gold Fund of Funds (FoFs).

### Initial data coverage target

These are project collection targets, not claims about the current
market universe:

  -----------------------------------------------------------------------
  Product category                                Initial target coverage
  ------------------------------ ----------------------------------------
  SGBs                                             30--50 issues/tranches

  Gold ETFs                                                  10--15 funds

  Gold FoFs                                                  10--15 funds

  Gold benchmark                    One consistent benchmark series, with
                                        source and methodology documented
  -----------------------------------------------------------------------

The final count will depend on product availability, data quality, and
whether comparable historical data can be obtained.

### Explorer fields

Depending on the category and source availability, display:

-   Product name and category.
-   Issuer or Asset Management Company.
-   Launch date or issue date.
-   NAV or exchange price.
-   AUM, where available.
-   Expense ratio or applicable costs.
-   Benchmark.
-   Tracking difference or tracking error, where measurable.
-   Liquidity indicators, such as trading volume or bid--ask spread for
    ETFs where reliable data are available.
-   Maturity, redemption, and exit information for SGBs.
-   Available historical data range.
-   Source and last-updated date.

### Filters

-   Product category.
-   Issuer/AMC.
-   Historical data availability.
-   Expense ratio range, where comparable.
-   AUM range, where available.
-   Selected performance period.
-   Other product-specific filters that are supported by the data.

**Output:** A structured catalogue where users can filter, sort, and
open a detailed product view.

## Module 3: Historical Performance Analysis

This module allows users to examine how gold and individual products
have performed over time.

### Time periods

-   1 year.
-   3 years.
-   5 years.
-   Since inception, where a meaningful and sufficiently complete series
    is available.
-   Custom date range, where supported.

The initial data plan targets approximately **3--5 years of historical
performance** for products where data are available. SGBs may have
different issue dates and maturity periods, so their available history
will vary.

### Metrics

**Absolute return**

\[ R =
`\left`{=tex}(`\frac{P_t}{P_0}`{=tex}-1`\right`{=tex})`\times100`{=tex}
\]

**Compound Annual Growth Rate (CAGR)**

\[ CAGR = `\left`{=tex}(`\frac{P_t}{P_0}`{=tex}`\right`{=tex})\^{1/n}-1
\]

where (P_0) is the starting value, (P_t) is the ending value, and (n) is
the elapsed time in years.

**Annualized volatility**

Calculated from periodic returns using a documented frequency and
annualization convention.

**Maximum drawdown**

The largest peak-to-trough decline over the selected period.

**Additional analysis, where data permit**

-   Rolling returns.
-   Risk-adjusted return measures, with assumptions stated.
-   Tracking difference against the selected benchmark.
-   Tracking error, if sufficient aligned observations exist.
-   Correlation with the gold benchmark.
-   Performance during selected market periods.

### Visualizations

-   Historical price/NAV chart.
-   Normalized growth of an initial investment.
-   Return comparison over selected periods.
-   Drawdown chart.
-   Rolling-return chart, if supported.
-   Product-versus-benchmark comparison.

### Comparability rules

-   Use consistent date ranges when comparing products.
-   Explain how missing dates and different trading calendars are
    handled.
-   Do not compare an ETF's exchange price, a FoF's NAV, and an SGB's
    indicative value as if they were identical observations without
    explaining the differences.
-   Include applicable SGB interest cash flows in total-return analysis
    where reliable data and a clearly defined methodology are available.
    A price-only comparison must be labelled as price-only.
-   State whether returns are before or after expenses, taxes, and other
    costs.

**Output:** Historical performance views with consistent definitions and
visible data coverage.

## Module 4: Side-by-Side Product Comparison

Comparison is one of the central features of Goldwise.

Users should be able to select multiple products and compare them in a
common interface.

### Comparison dimensions

  -----------------------------------------------------------------------
  Dimension                           What is compared
  ----------------------------------- -----------------------------------
  Historical return                   Return over a common selected
                                      period

  CAGR                                Annualized growth over the common
                                      period

  Volatility                          Variation in periodic returns

  Maximum drawdown                    Largest observed peak-to-trough
                                      decline

  Expense ratio/cost                  Applicable product costs, with
                                      category differences explained

  Tracking behaviour                  Difference from the selected
                                      benchmark, where measurable

  Liquidity                           Relevant trading or redemption
                                      characteristics

  Investment structure                How the product provides gold
                                      exposure

  Holding period                      Relevant maturity, exit, or holding
                                      considerations

  Income/cash flow                    Product-specific interest or
                                      distributions, where applicable

  Data coverage                       Length and completeness of the
                                      available series
  -----------------------------------------------------------------------

### Comparison behaviour

-   Allow comparison within a category and across categories.
-   Make differences in product structure explicit.
-   Use a common date window for comparable performance calculations.
-   Mark unavailable or non-comparable metrics rather than filling them
    with invented values.
-   Provide short explanations of why a metric matters.
-   Allow the user to change the time period and see the comparison
    update.

**Output:** A transparent comparison table and supporting charts that
expose both similarities and trade-offs.

## Module 5: Investment Simulator

The simulator lets users explore hypothetical investment outcomes using
historical data and user-defined assumptions.

### Inputs

-   Initial lump-sum investment.
-   Optional recurring contribution amount.
-   Contribution frequency, if recurring investment is implemented.
-   Selected product.
-   Start date or historical investment period.
-   End date or holding duration.
-   Optional comparison against another product or the gold benchmark.

### Outputs

-   Total amount invested.
-   Historical ending value.
-   Absolute gain or loss.
-   Percentage return.
-   CAGR, where appropriate.
-   Value-over-time chart.
-   Comparison of multiple hypothetical strategies.
-   Relevant costs or cash flows, where supported by the model.

### Simulator modes

**A. Historical lump-sum simulation**

The user selects an amount and a historical start/end period. Goldwise
estimates what that amount would have become using the observed product
price/NAV series and the stated transaction assumptions.

**B. Recurring investment simulation**

The user selects a recurring contribution amount and frequency. The
simulator applies contributions at the defined intervals using the
available historical observations.

**C. Product comparison simulation**

The same investment assumptions are applied to selected products over a
common period, allowing the user to compare historical outcomes.

### Critical distinction

The simulator is a historical backtesting and educational tool. It does
not forecast or guarantee future returns. Results depend on the selected
dates, available data, contribution timing, fees, taxes, liquidity, and
other assumptions.

The first implementation should prioritize a reliable lump-sum
simulation. Recurring contributions and additional cost/tax modelling
can be added once the underlying price/NAV data and transaction
assumptions are sufficiently robust.

**Output:** An interactive historical investment calculator with clearly
stated assumptions.

## Module 6: Preference-Based Decision Support

This module translates user-stated preferences into a transparent
shortlist and comparison.

### Potential user preferences

-   Investment amount.
-   Intended holding period.
-   Need for liquidity.
-   Risk tolerance.
-   Preference for exchange-traded or fund-based products.
-   Preference for a government-issued instrument.
-   Sensitivity to expenses.
-   Need for recurring investment.
-   Willingness to hold until maturity, where relevant.

### Decision-support workflow

1.  Collect the user's stated constraints and preferences.
2.  Filter out products that do not satisfy hard constraints, where the
    relevant information is available.
3.  Compare remaining products on relevant historical, cost, liquidity,
    and structural dimensions.
4.  Apply a transparent scoring or ranking method, if implemented.
5.  Show the reason each product appears in the shortlist.
6.  Display trade-offs and missing information.
7.  Allow the user to change preferences and compare the results again.

### Ranking methodology

A weighted scoring method may be used, but it must be transparent and
configurable. For example, the system may consider historical return,
volatility, drawdown, costs, and liquidity. The weights should reflect
the selected user preferences and should be documented.

Do not collapse all product characteristics into one unexplained score.
A product may rank highly on return but poorly on liquidity or costs.
The interface should preserve that distinction.

**Output:** A preference-aligned shortlist with explanations, not a
universal or guaranteed investment recommendation.

## Module 7: Gemini-Powered Goldwise Assistant

The AI assistant provides a natural-language interface over the
structured Goldwise platform.

### Role of Gemini

Gemini should help users:

-   Understand the difference between SGBs, Gold ETFs, and Gold FoFs.
-   Ask questions about a specific product.
-   Interpret performance and risk metrics.
-   Summarize a comparison already generated by the dashboard.
-   Understand simulator assumptions and results.
-   Explore products that match stated preferences.
-   Ask follow-up questions about the data and sources.
-   Understand why a product was included or excluded from a shortlist.

### Example questions

-   "Explain the difference between a Gold ETF and a Gold FoF."
-   "Compare these three ETFs over the last three years."
-   "Why does this product have a higher tracking difference?"
-   "Explain maximum drawdown in simple terms."
-   "How would a hypothetical ₹50,000 investment have performed over
    this historical period?"
-   "I may need liquidity within two years. What product characteristics
    should I examine?"
-   "Why did this product appear in my shortlist?"
-   "Which data source supports this figure?"

### Evidence-grounding requirements

The assistant must use Goldwise's structured data and trusted source
material.

A suitable flow is:

1.  Identify the user's question and the relevant product or metric.
2.  Retrieve the relevant product records, historical observations, and
    source metadata.
3.  Use deterministic calculation functions for returns and other
    financial metrics.
4.  Pass the retrieved evidence and calculation outputs to Gemini for
    explanation.
5.  Require the answer to distinguish facts, calculations, assumptions,
    and general educational explanations.
6.  Display source links and data timestamps wherever possible.
7.  State when the required data are unavailable or stale.

### Guardrails

-   Do not allow the model to invent current prices, NAVs, returns,
    expense ratios, maturity dates, or tax rules.
-   Do not ask the LLM to perform financial calculations when
    deterministic code can do them.
-   Do not present historical performance as a prediction.
-   Do not claim that a product is suitable without showing the
    preferences and criteria used.
-   Do not provide unsupported personalized financial advice.
-   Clearly distinguish official product terms from third-party
    commentary.
-   For tax or regulatory explanations, use current authoritative
    sources and show the relevant date.
-   If retrieved evidence is insufficient, the assistant must say so.

**Output:** A conversational, source-grounded interface that explains
and contextualizes the platform's analysis.

------------------------------------------------------------------------

# 6. Data Requirements and Sources

Goldwise depends on a reliable and standardized dataset. Data collection
and quality control are foundational work, not optional supporting
tasks.

## 6.1 Initial data coverage target

  Dataset             Initial target
  ------------------- ------------------------------------------
  SGBs                30--50 issues/tranches
  Gold ETFs           10--15 funds
  Gold FoFs           10--15 funds
  Gold benchmark      A consistent benchmark time series
  Historical window   Approximately 3--5 years where available

These are initial project targets. Actual coverage will depend on source
availability, data licensing, historical completeness, and product
existence.

## 6.2 Potential data sources

  -----------------------------------------------------------------------
  Source                              Potential information
  ----------------------------------- -----------------------------------
  Yahoo Finance / `yfinance`          Historical market prices for
                                      supported listed instruments and
                                      benchmark proxies

  MFAPI                               Mutual fund NAV history, including
                                      eligible Gold FoFs

  AMFI                                Mutual fund NAV and scheme
                                      information

  NSE                                 ETF trading information and
                                      exchange-listed product details

  BSE                                 Exchange information and relevant
                                      product disclosures

  RBI                                 Official SGB notifications, issue
                                      terms, interest, redemption, and
                                      related announcements

  IBJA                                Gold price benchmarks and market
                                      reference information

  AMC websites and factsheets         Expense ratios, AUM, benchmark,
                                      scheme details, tracking
                                      information, and disclosures
  -----------------------------------------------------------------------

These are candidate sources. Availability and terms of use must be
verified before implementation. A source should not be assumed to
provide every required field.

## 6.3 Data source hierarchy

Where possible, use:

1.  Official government and regulatory sources for SGB terms and
    announcements.
2.  Official exchange sources for listed product and trading
    information.
3.  AMFI and AMC sources for mutual fund NAVs and scheme details.
4.  A documented benchmark provider for gold price series.
5.  Third-party market-data sources as supplementary inputs or fallback
    references, with source labels.

## 6.4 Data quality and standardization

For each record, maintain:

-   Product identifier.
-   Product name.
-   Category.
-   Issuer or AMC.
-   Observation date.
-   Price, NAV, or relevant value.
-   Currency and units.
-   Source name.
-   Source URL or reference.
-   Retrieval timestamp.
-   Data frequency.
-   Data-quality status.

Additional requirements:

-   Normalize dates and currency units.
-   Remove duplicate observations.
-   Validate missing values and anomalous prices.
-   Keep raw source data separate from processed data.
-   Record the transformations applied.
-   Avoid silently filling missing observations.
-   Preserve source provenance.
-   Distinguish market price from NAV and benchmark price.
-   Store the last successful data update.

## 6.5 Data collection strategy

A practical ingestion process:

1.  Create a product master list.
2.  Map each product to its available source identifiers.
3.  Collect historical price/NAV data.
4.  Collect product metadata and official terms.
5.  Collect the gold benchmark series.
6.  Standardize observations into a common internal schema.
7.  Validate completeness, dates, and outliers.
8.  Store raw and processed records separately.
9.  Refresh supported datasets periodically.
10. Record data-source failures and stale-data status.

Do not assume that every source has a stable public API. Where a source
does not provide a supported API, use permitted downloads or documented
collection methods and respect its terms.

# 7. Financial and Analytical Methodology

## 7.1 Return calculation

For a price or NAV series:

\[ R_t = `\frac{P_t-P_{t-1}}{P_{t-1}}`{=tex} \]

Cumulative return:

\[ R\_{`\text{total}`{=tex}} =
`\frac{P_{\text{end}}}{P_{\text{start}}}`{=tex}-1 \]

CAGR:

\[ CAGR =
`\left`{=tex}(`\frac{P_{\text{end}}}{P_{\text{start}}}`{=tex}`\right`{=tex})\^{1/n}-1
\]

The methodology must specify whether values are adjusted, whether
distributions or SGB interest are included, and how the time period is
measured.

## 7.2 Volatility

Volatility is calculated from periodic returns. For daily returns, a
common annualization convention is:

\[ `\sigma`{=tex}*{`\text{annual}`{=tex}} =
`\sigma`{=tex}*{`\text{daily}`{=tex}}`\sqrt{252}`{=tex} \]

The convention should be selected consistently and documented. The
number of trading periods may differ across instruments and datasets.

## 7.3 Maximum drawdown

For each observation, calculate the running peak and the decline from
that peak:

\[ DD_t = `\frac{P_t}{\max(P_1,\ldots,P_t)}`{=tex}-1 \]

Maximum drawdown is the minimum value of (DD_t) over the selected
period.

## 7.4 Tracking difference and tracking error

Where a suitable benchmark and aligned observations exist:

-   Tracking difference measures the difference between product return
    and benchmark return over a specified period.
-   Tracking error measures the variability of periodic return
    differences.

The benchmark must be appropriate to the product. The methodology should
not compare unrelated benchmark definitions.

## 7.5 Correlation and regression

Potential analyses include:

-   Correlation between product returns and the selected gold benchmark.
-   Regression-based examination of product returns relative to
    benchmark returns.
-   Comparison of tracking behaviour across products.

These analyses are descriptive and do not automatically establish
causation.

## 7.6 Product-level differences

Different categories require different treatment:

**SGBs** - Issue price and issue date. - Applicable interest payments. -
Maturity date. - Premature redemption conditions. - Exchange-traded
price, if relevant. - Total-return versus price-only calculation.

**Gold ETFs** - NAV and exchange-traded market price. - Expense ratio. -
Trading volume and bid--ask spread, if available. - Tracking
difference/error. - Fund size and scheme details.

**Gold FoFs** - NAV history. - Expense ratio at the FoF level and
underlying fund level, where applicable. - Investment structure. -
Applicable exit load, where relevant. - Underlying exposure and
benchmark.

Do not force all product categories into an identical feature set when
their structures differ.

------------------------------------------------------------------------

# 8. Machine Learning and Advanced Analytics

The initial Goldwise product should prioritize reliable financial
calculations and interpretable analytics. Machine learning should be
added only where it provides a defensible benefit.

## 8.1 Potential analytical methods

### Clustering --- K-Means

Possible use: group comparable products using selected features such as:

-   Historical return.
-   Volatility.
-   Maximum drawdown.
-   Expense ratio.
-   Tracking difference.

The resulting clusters could help users explore groups such as
lower-volatility or higher-cost products.

**Caution:** Clustering is exploratory. Cluster labels are not
investment ratings, and products should only be clustered when the input
variables are comparable.

### Regression analysis

Possible use:

-   Examine the relationship between product returns and the gold
    benchmark.
-   Estimate benchmark sensitivity.
-   Study historical tracking behaviour.

### Risk profiling

A transparent rules-based or statistical profile can categorize
historical risk characteristics using volatility and drawdown. Such
categories must be labelled as historical measures, not predictions of
future risk.

### Optional future work

-   Regime or volatility analysis.
-   More advanced portfolio-level analysis.
-   Scenario sensitivity analysis.
-   Explainable ranking models, if a defensible labelled target and
    evaluation method exist.

## 8.2 Avoid unnecessary ML

Goldwise does not need a complex predictive model merely to qualify as
an AI/ML project. Financial calculations, data engineering, statistical
analysis, clustering, and evidence-grounded AI can form a meaningful
analytical system.

If a model is introduced, document:

-   The purpose of the model.
-   Input features.
-   Training or fitting methodology.
-   Validation procedure.
-   Evaluation metrics.
-   Known limitations.
-   How the output is used in the product.

Do not use a model to predict future gold prices or investment returns
unless there is a separate, rigorous forecasting design and an
appropriate evaluation strategy.

------------------------------------------------------------------------

# 9. Investment Simulator: Detailed Design

## 9.1 Historical lump-sum simulation

Inputs:

-   Investment amount.
-   Product.
-   Historical start date.
-   Historical end date.
-   Optional cost assumptions.

Process:

1.  Find the appropriate starting observation.
2.  Determine the number of units that could hypothetically be purchased
    under the stated price assumptions.
3.  Track the value using subsequent observations.
4.  Apply any explicitly modelled cash flows or costs.
5.  Calculate ending value and return.
6.  Display the assumptions and limitations.

For a simplified price-only simulation:

\[ Units = `\frac{Investment\ Amount}{Entry\ Price}`{=tex} \]

\[ Ending Value = Units `\times `{=tex}Exit Price \]

This simplified method must not be described as a complete real-world
transaction simulation if brokerage, spreads, taxes, fees, or other
costs are excluded.

## 9.2 Recurring investment simulation

Inputs:

-   Contribution amount.
-   Contribution frequency.
-   Product.
-   Historical period.

For each contribution date, calculate units purchased using the selected
pricing convention. Sum units and compare the final holding value with
the total amount contributed.

\[ Total Invested = `\sum`{=tex}\_{i=1}\^{N} Contribution_i \]

\[ Total Units =
`\sum`{=tex}\_{i=1}\^{N}`\frac{Contribution_i}{Price_i}`{=tex} \]

\[ Ending Value = Total Units `\times `{=tex}Final Price \]

The implementation must document how non-trading dates, missing NAV
observations, and transaction costs are handled.

## 9.3 Simulator output

-   Total amount invested.
-   Total units accumulated.
-   Ending value.
-   Absolute gain or loss.
-   Percentage return.
-   Annualized return, where appropriate.
-   Growth chart.
-   Product comparison.
-   Assumptions and exclusions.

The interface must clearly state that the simulation uses historical
data and does not predict future results.

------------------------------------------------------------------------

# 10. Preference-Based Decision Engine

The decision engine should be a transparent rules-and-analytics layer
rather than an opaque AI-generated recommendation.

## 10.1 Preference inputs

-   Investment amount.
-   Intended holding period.
-   Liquidity requirements.
-   Risk tolerance.
-   Cost sensitivity.
-   Preference for a particular product structure.
-   Need for recurring contributions.
-   Willingness to hold an SGB until maturity, where relevant.

## 10.2 Decision process

1.  Validate the user's inputs.
2.  Apply hard constraints based on product characteristics and
    available information.
3.  Generate a candidate product set.
4.  Calculate relevant metrics over a common historical period.
5.  Rank or group candidates using documented criteria.
6.  Explain the trade-offs.
7.  Present missing or unavailable information.
8.  Allow the user to revise preferences.

## 10.3 Explainability

Every shortlist result should answer:

-   Why was this product included?
-   Which user preference did it satisfy?
-   Which metric supported the comparison?
-   What trade-off should the user consider?
-   What information was unavailable?

The platform should not claim to know a user's complete financial
circumstances. It should describe its output as preference-based
educational decision support.

------------------------------------------------------------------------

# 11. Gemini Assistant: Technical Design

## 11.1 Suggested architecture

The assistant should not receive unrestricted authority to invent or
calculate product data.

A suitable architecture:

``` text
User Question
     |
     v
Question Understanding
     |
     v
Intent / Entity Identification
     |
     v
Goldwise Data Retrieval
     |
     +----------------------+
     |                      |
     v                      v
Product Database       Financial Metrics
     |                 Calculation Functions
     |                      |
     +----------+-----------+
                |
                v
      Evidence and Context
                |
                v
           Gemini API
                |
                v
       Grounded Response
                |
                v
  Sources / Dates / Limitations
```

## 11.2 Retrieval approach

Use structured database queries for:

-   Product metadata.
-   Historical prices and NAVs.
-   Expense ratios.
-   Benchmark observations.
-   Calculated performance metrics.
-   Simulation outputs.

Use document retrieval for:

-   Official SGB notifications.
-   AMC factsheets.
-   Scheme information documents.
-   Official product disclosures.
-   Relevant official explanations.

A hybrid retrieval approach can combine structured queries with document
retrieval. The assistant should retrieve only relevant evidence for the
question.

## 11.3 Deterministic tools

Expose application functions for:

-   `get_product_details`
-   `get_historical_data`
-   `calculate_returns`
-   `calculate_cagr`
-   `calculate_volatility`
-   `calculate_max_drawdown`
-   `compare_products`
-   `run_investment_simulation`
-   `get_source_information`

Gemini can decide which function is relevant, explain the returned
result, and ask follow-up questions. The functions---not the language
model---should perform the actual calculations.

## 11.4 Source attribution

Assistant responses should identify:

-   Source name.
-   Source URL or document reference.
-   Data observation date.
-   Retrieval or refresh date, where applicable.
-   Whether the value is official, derived, or estimated.

If a question cannot be answered from the available evidence, the
assistant should say so rather than fabricate an answer.

------------------------------------------------------------------------

# 12. Proposed System Architecture

``` text
                 DATA SOURCES
                       |
      +----------------+----------------+
      |                |                |
      v                v                v
   RBI / NSE       AMFI / MFAPI      IBJA / Market
   BSE / AMC       Fund Factsheets    Data Providers
      |                |                |
      +----------------+----------------+
                       |
                       v
              DATA INGESTION LAYER
                       |
                       v
             VALIDATION / CLEANING
                       |
                       v
                STANDARDIZATION
                       |
                       v
                DATABASE LAYER
                       |
        +--------------+----------------+
        |              |                |
        v              v                v
   Product Data   Price / NAV Data   Source Metadata
        |              |                |
        +--------------+----------------+
                       |
                       v
              ANALYTICS ENGINE
                       |
      +----------------+-------------------+
      |                |                   |
      v                v                   v
 Performance       Comparison          Simulator
 Analytics         Engine              Engine
      |                |                   |
      +----------------+-------------------+
                       |
                       v
              DECISION-SUPPORT ENGINE
                       |
                       v
              GEMINI ASSISTANT LAYER
          (retrieval + deterministic tools)
                       |
                       v
                API / BACKEND
                       |
                       v
               DASHBOARD FRONTEND
```

------------------------------------------------------------------------

# 13. Suggested Technology Stack

The following is a proposed stack. It should be finalized based on
data-source constraints and implementation complexity.

  -----------------------------------------------------------------------
  Layer                   Suggested technology    Purpose
  ----------------------- ----------------------- -----------------------
  Programming             Python                  Data processing and
                                                  backend

  Data manipulation       Pandas, NumPy           Cleaning and financial
                                                  calculations

  Market data             yfinance and permitted  Historical market
                          source APIs/downloads   observations

  Mutual fund data        MFAPI, AMFI sources     NAV and scheme
                                                  information

  Visualization           Plotly                  Interactive financial
                                                  charts

  Dashboard               Streamlit               Main user-facing
                                                  analytical interface

  Backend/API             FastAPI                 Data and analytics
                                                  endpoints

  Database                PostgreSQL              Structured product and
                                                  observation storage

  AI assistant            Gemini API              Conversational
                                                  explanation and
                                                  assistance

  Retrieval               Embeddings and vector   Search official
                          retrieval, if document  documents and
                          retrieval is needed     factsheets

  ML                      Scikit-learn            Clustering and
                                                  statistical modelling

  Scheduling              APScheduler or an       Periodic data refresh
                          equivalent scheduler    

  Version control         Git and GitHub          Source control and
                                                  collaboration

  Deployment              Docker and a suitable   Reproducible deployment
                          cloud platform          
  -----------------------------------------------------------------------

## 13.1 Suggested application structure

``` text
goldwise/
|
├── app/
│   ├── main.py
│   ├── pages/
│   │   ├── overview.py
│   │   ├── explorer.py
│   │   ├── performance.py
│   │   ├── comparison.py
│   │   ├── simulator.py
│   │   └── assistant.py
│   |
│   ├── services/
│   │   ├── data_service.py
│   │   ├── performance_service.py
│   │   ├── comparison_service.py
│   │   ├── simulation_service.py
│   │   └── recommendation_service.py
│   |
│   ├── ai/
│   │   ├── gemini_client.py
│   │   ├── retrieval.py
│   │   ├── prompts.py
│   │   └── tools.py
│   |
│   ├── data/
│   │   ├── ingestion.py
│   │   ├── cleaning.py
│   │   └── validation.py
│   |
│   ├── analytics/
│   │   ├── returns.py
│   │   ├── risk.py
│   │   ├── clustering.py
│   │   └── metrics.py
│   |
│   └── database/
│       ├── connection.py
│       ├── models.py
│       └── queries.py
|
├── datasets/
├── notebooks/
├── tests/
├── requirements.txt
├── Dockerfile
├── README.md
└── .env.example
```

This is a suggested organization, not a requirement to create every file
at the beginning. Start with the data pipeline and core calculations,
then separate modules as the implementation grows.

------------------------------------------------------------------------

# 14. Suggested Database Design

A relational database is suitable because Goldwise contains structured
products, time-series observations, and source records.

## 14.1 Product table

Potential fields:

-   `product_id`
-   `product_name`
-   `category`
-   `issuer`
-   `launch_date`
-   `benchmark`
-   `expense_ratio`
-   `aum`
-   `maturity_date`
-   `source_id`
-   `last_updated`

Some fields are category-specific and may be null or stored in related
detail tables.

## 14.2 Historical observations table

Potential fields:

-   `observation_id`
-   `product_id`
-   `observation_date`
-   `value`
-   `value_type` (NAV, exchange price, benchmark price, etc.)
-   `currency`
-   `source_id`

Use a uniqueness constraint for the product, date, and value type as
appropriate.

## 14.3 Source table

Potential fields:

-   `source_id`
-   `source_name`
-   `source_url`
-   `source_type`
-   `retrieved_at`
-   `data_timestamp`
-   `reliability_notes`

## 14.4 Product-specific detail tables

Separate tables can hold SGB-specific fields, ETF-specific fields, and
FoF-specific fields. This avoids forcing incompatible fields into a
single universal product schema.

## 14.5 Calculated metrics

Calculated metrics can either be computed on demand or stored with:

-   Product identifier.
-   Metric name.
-   Period start and end.
-   Metric value.
-   Calculation methodology/version.
-   Calculation timestamp.
-   Source-data version or reference.

Stored metrics must be reproducible from the underlying observations.

------------------------------------------------------------------------

# 15. Evaluation Strategy

Goldwise should be evaluated on data quality, analytical correctness,
usability, and AI grounding---not simply on the number of features.

  -----------------------------------------------------------------------
  Component                           Evaluation
  ----------------------------------- -----------------------------------
  Data ingestion                      Completeness, source traceability,
                                      update reliability

  Data cleaning                       Duplicate detection, missing-value
                                      handling, anomaly checks

  Return calculations                 Unit tests against manually
                                      verified examples

  Risk calculations                   Unit tests and consistency across
                                      defined periods

  Comparison                          Same-period consistency and correct
                                      treatment of product differences

  Simulator                           Validation against hand-calculated
                                      test cases

  Clustering                          Cluster stability and
                                      interpretability, if implemented

  Decision support                    Constraint satisfaction and
                                      explanation quality

  Gemini assistant                    Groundedness, source correctness,
                                      refusal when evidence is missing

  Dashboard                           Usability, clarity, loading time,
                                      and understandable visualizations
  -----------------------------------------------------------------------

## 15.1 Important test cases

-   Product has insufficient historical data.
-   Product has missing observations.
-   Selected date is a non-trading day.
-   Products have different inception dates.
-   User selects incompatible comparison periods.
-   SGB price-only return is compared with a total-return series.
-   Data source is unavailable.
-   Latest data are stale.
-   Assistant is asked for a price that is not in the database.
-   Assistant is asked to predict guaranteed future returns.
-   Simulator is given zero, negative, or invalid input values.

------------------------------------------------------------------------

# 16. Expected Deliverables

1.  Gold investment product master dataset.
2.  Historical price/NAV dataset for selected SGBs, ETFs, and FoFs.
3.  Gold benchmark dataset with documented source and methodology.
4.  Data ingestion and validation pipeline.
5.  PostgreSQL database for product, observation, and source data.
6.  Gold market overview dashboard.
7.  Product explorer.
8.  Historical performance analytics.
9.  Side-by-side comparison engine.
10. Historical investment simulator.
11. Preference-based decision-support engine.
12. Gemini-powered, evidence-grounded assistant.
13. Interactive charts and source-linked explanations.
14. Tests for calculations, data processing, and assistant grounding.
15. Documentation describing data sources, methods, assumptions, and
    limitations.
16. Deployed application or reproducible local setup.

------------------------------------------------------------------------

# 17. Scope Management

## 17.1 Minimum viable product

The first complete version should include:

1.  A product master list covering the three target categories.
2.  Historical data for a manageable initial set of products.
3.  Gold benchmark series.
4.  Data cleaning and validation.
5.  Gold market overview.
6.  Product explorer.
7.  Return, CAGR, volatility, and drawdown calculations.
8.  Side-by-side comparison.
9.  Historical lump-sum investment simulator.
10. A basic Gemini assistant that answers using Goldwise data and source
    documents.

This is the minimum product that demonstrates the central Goldwise
concept.

## 17.2 Extended version

After the MVP is reliable, add:

-   More complete product coverage.
-   Recurring investment simulation.
-   Tracking difference and tracking error.
-   Product clustering.
-   Preference-based ranking.
-   Richer document retrieval.
-   More detailed SGB cash-flow and maturity analysis.
-   Advanced comparison visualizations.
-   Periodic data refresh and monitoring.
-   Portfolio-level analysis, if the scope permits.

## 17.3 Explicit exclusions for the initial version

Unless separately implemented and validated, do not claim:

-   Real-time trading or execution.
-   Guaranteed future gold-price forecasts.
-   Guaranteed investment returns.
-   Personalized regulated financial advice.
-   Complete tax calculations for every investor.
-   Complete coverage of every gold product in India.
-   Fully automated collection from every official source.
-   A fully accurate total-return comparison when relevant cash flows or
    costs are missing.

------------------------------------------------------------------------

# 18. Risks and Limitations

### 1. Inconsistent data sources

Different providers may report different prices, NAVs, timestamps, and
historical coverage. Goldwise must preserve source information and
explain differences.

### 2. Product structure differences

SGBs, ETFs, and FoFs are not interchangeable. Their costs, cash flows,
liquidity, maturity, and valuation mechanisms differ.

### 3. Historical data gaps

Some products may not have a full 3--5-year history. Comparisons must
use an appropriate common period or explicitly state the difference.

### 4. Benchmark selection

Different gold benchmarks may use different units, timings, or
methodologies. Select and document the benchmark used for each analysis.

### 5. Total-return calculation

SGB interest and other relevant cash flows may be excluded from simple
price comparisons. Clearly label price-only results and implement
total-return treatment only when the necessary data are available.

### 6. Market liquidity

An ETF's NAV does not necessarily equal the price at which a user can
transact. Exchange price, volume, and bid--ask spread may matter.

### 7. Regulatory and tax changes

Tax and regulatory treatment can change. Use current official
references, include effective dates, and avoid hardcoding unsupported
assumptions.

### 8. AI hallucination

Gemini may generate plausible but incorrect financial statements. Ground
responses in retrieved evidence and deterministic calculations, and test
for unsupported claims.

### 9. Ranking bias

A weighted scoring method can reflect arbitrary weights. Expose the
criteria and allow users to understand how rankings change.

### 10. Historical performance bias

Past performance does not guarantee future returns. Historical
comparisons are analytical evidence, not future predictions.

------------------------------------------------------------------------

# 19. Implementation Roadmap

  -----------------------------------------------------------------------
  Phase                   Work                    Completion evidence
  ----------------------- ----------------------- -----------------------
  1\. Requirements and    Finalize product        Requirements and data
  scope                   categories, metrics,    plan
                          users, and initial      
                          coverage                

  2\. Source assessment   Verify data sources,    Source inventory
                          identifiers, coverage,  
                          and permitted access    

  3\. Data collection     Collect SGB, ETF, FoF,  Raw datasets
                          and benchmark data      

  4\. Data engineering    Clean, standardize,     Reproducible data
                          validate, and store     pipeline
                          observations            

  5\. Financial analytics Implement and test      Verified calculation
                          returns and risk        module
                          metrics                 

  6\. Dashboard           Build overview,         Working dashboard
                          explorer, performance,  
                          and comparison pages    

  7\. Simulator           Implement historical    Tested simulator
                          lump-sum simulation     

  8\. Decision support    Add preference filters  Explainable shortlist
                          and transparent ranking 

  9\. Gemini assistant    Connect retrieval,      Tested assistant
                          deterministic           
                          functions, and          
                          source-grounded answers 

  10\. Final evaluation   Test data,              Evaluation report
                          calculations,           
                          usability, and          
                          grounding               

  11\. Deployment and     Package and document    Reproducible project
  documentation           the application         release
  -----------------------------------------------------------------------

The order is deliberate: the assistant should be built on top of
reliable data and analytical functions, not before them.

------------------------------------------------------------------------

# 20. What Makes Goldwise Distinctive

Goldwise is not differentiated merely by putting a chatbot next to a
financial dashboard. Its value comes from connecting several stages of
investment research in one workflow.

### 1. Unified product coverage

It brings SGBs, Gold ETFs, and Gold FoFs into one structured environment
while preserving their category-specific characteristics.

### 2. Comparable historical analytics

It provides consistent return and risk calculations, with explicit
handling of differences in data coverage and product structure.

### 3. Interactive investment simulation

Users can explore historical outcomes using their own hypothetical
investment amount and holding period.

### 4. Preference-based decision support

It helps users understand trade-offs based on their stated constraints
rather than ranking products by return alone.

### 5. Evidence-grounded AI

Gemini explains the underlying data, metrics, and comparisons while
relying on retrieved records and deterministic calculations.

### 6. Traceability

Users can see where information came from, when it was updated, and
whether a value is observed, calculated, or simulated.

The combination of data engineering, financial analytics, product
comparison, simulation, explainability, and grounded AI gives Goldwise
its central identity.

------------------------------------------------------------------------

# 21. Final Refined Project Statement

**Goldwise: An AI-Powered Gold Investment Intelligence and
Decision-Support Platform for Indian Retail Investors**

Goldwise is a unified investment intelligence platform designed to
simplify the evaluation and comparison of gold investment products in
India. It focuses on Sovereign Gold Bonds, Gold Exchange-Traded Funds,
and Gold Fund of Funds, bringing together product information,
historical market data, and relevant official disclosures in a
structured environment. The platform provides historical performance and
risk analytics, side-by-side product comparisons, and interactive
investment simulations to help users understand the behaviour and
trade-offs of different gold investment options. It also incorporates a
preference-based decision-support engine and a Gemini-powered
conversational assistant that interprets platform data and responds
using verified sources and deterministic financial calculations. By
combining structured financial data, analytical tools, transparent
comparisons, and evidence-grounded AI, Goldwise aims to make gold
investment research more accessible, understandable, and traceable for
Indian retail investors.

------------------------------------------------------------------------

# 22. Decisions to Finalize Before Development

The project direction is defined, but the following implementation
decisions must be verified before coding:

1.  **Product universe:** Which exact SGB issues, Gold ETFs, and Gold
    FoFs will be included initially?
2.  **Historical period:** Which products have reliable 3--5-year
    observations, and what common comparison periods are possible?
3.  **Benchmark:** Which gold benchmark and unit will be used?
4.  **Data access:** Which sources provide usable historical data and
    what are their access and usage conditions?
5.  **SGB treatment:** Will the initial release include interest cash
    flows and total-return calculations, or clearly labelled price-only
    analysis?
6.  **Cost treatment:** Which expense, brokerage, spread, exit-load, and
    tax components can be reliably modelled?
7.  **Simulator:** Will the MVP support lump-sum only, with recurring
    investment added later?
8.  **Decision engine:** Which preferences are hard constraints and
    which are ranking criteria?
9.  **Gemini grounding:** Which official documents will be indexed, and
    which calculations will be exposed as deterministic tools?
10. **Refresh frequency:** How often can each data source realistically
    be updated?
11. **Deployment:** Where will the dashboard, backend, database, and
    assistant be hosted?

These decisions should be based on a small proof-of-data exercise.
Verify that the chosen sources can supply the required observations
before promising full coverage.

------------------------------------------------------------------------

# 23. Final Product Direction in One Line

**Goldwise is a data-first gold investment intelligence platform that
helps Indian retail investors explore, compare, simulate, and understand
SGBs, Gold ETFs, and Gold FoFs through transparent financial analytics
and an evidence-grounded Gemini assistant.**
