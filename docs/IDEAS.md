# Where Lab Ledger could go next

Notes for the roadmap, written from the bench rather than from the code. Each
one is here because it answers a question a dental technician actually asks,
and because the data to answer it is already in the file or one field away.

Ordered by what it would change for a real lab, not by how hard it is.

---

## 1. Delivery dates, and what is late

The one thing missing that a lab checks every morning. A job has a date it
arrived; it does not yet have a date it is due. Add `dueDate` and the Incoming
list sorts by it, colours what is due today, and shows what is already late.
Nothing else in the app needs to change, and it turns Incoming from a list into
a plan for the day.

Next to it: how long a type of work actually takes, measured rather than
guessed. The app already knows when a job arrived and when it was marked done;
the average of that per work type is the honest lead time to quote a practice.

## 2. What a job really costs, including the hour

Material cost is solid. Labour is not in it at all, which is why the margin is
called gross. Give each work type an expected time in minutes and the catalog
can show a cost per unit that includes the bench: `material + minutes x hourly
rate`, where the hourly rate comes from the running costs and the working
calendar already in Settings - the app knows what an hour of that lab costs.

That single number changes decisions: it is what tells you that a repair at
60 EUR is losing money while a crown at 165 is not.

## 3. Invoicing, or at least the month's statement per practice

The lab already records everything an invoice needs. A "statement" per practice
per month - works, units, prices, total - exported to PDF or a sheet would
remove the second pass through a spreadsheet at month end. Full invoicing means
numbering, VAT and legal formats, which is a bigger commitment; the statement is
90% of the relief for 10% of the work.

## 4. Prices per practice

One list price for everyone is not how a lab works: the practice that sends
forty units a month does not pay what the one sending three pays. A per-client
price override on a work type, falling back to the list price, would make the
margins honest per client. The "revenue share by client" chart becomes worth
reading the moment this exists.

## 5. A photo on the job

A technician recognises a case by looking at it. Attaching one or two photos to
a work - the model, the shade, the finished piece - costs little (files next to
the data file) and makes the archive searchable by memory rather than by code.
Also the natural place to record the shade, which today has to go in the note.

## 6. Material stock, not just material price

The app knows what each job consumes. Subtract it from a stock count and it can
say what is running out before the disc is on the last element. A minimum level
per material and a quiet warning in the catalog would be enough - no orders, no
suppliers, just "you are about to run out of zirconia".

## 7. The redo, taken seriously

Redos are counted as a loss, which is right, but the useful question is why. A
reason on the redo - fit, shade, fracture, the practice changed its mind - and a
small breakdown in the summary turns a cost into a lesson. Three fractures on
the same material in a month is a fact worth seeing.

## 8. Implants, the lab's actual vocabulary

A crown on an implant is not one thing: it depends on the system and the
platform. A short list of implant systems, selectable on the job, and the
Ti-base tied to it, would remove the most common source of a wrong order. This
is the one item on the list that a non-technician would never think of.

## 9. Where the day went

The summary answers what was produced, not where the time went. If work types
carry minutes (item 2), the same rows give hours per week per operator - the
number that says whether the bench is full, and whether hiring is the answer or
raising prices is.

## 10. Two computers, one lab

The companion workbook already makes the numbers shareable. It does not make the
app multi-seat: two people editing on two machines would overwrite each other.
An honest next step is not sync but a merge - import a backup and keep both sets
of works by id - which covers the lab whose second bench records on a laptop.

---

## Deliberately not on this list

- **A cloud account.** The reason labs try this app is that it does not have one.
- **Automatic invoicing to the tax authority.** Country-specific, changes every
  year, and a mistake there is expensive. Better left to the accountant's
  software, fed by the export.
- **A mobile app.** The bench has a computer. A phone would be a second place to
  keep the same data in step, which is the problem this app avoids.

---

Copyright © 2026 Vladyslav Pereverzyev - Business Source License 1.1
