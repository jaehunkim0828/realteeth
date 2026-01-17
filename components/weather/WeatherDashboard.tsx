import { SiteHeader } from "@/components/common/SiteHeader";
import { LocationPinIcon, SearchIcon, StarIcon } from "@/components/common/icons";

export function WeatherDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <SiteHeader />

        <main className="py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            대한민국 날씨
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            현재 위치의 날씨를 확인하고, 행정구역을 검색해 즐겨찾기에 추가하세요.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <SearchIcon className="h-4 w-4 text-slate-600" />
                      장소 검색
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      예) 서울특별시, 종로구, 청운동
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-sky-400">
                    <SearchIcon className="h-4 w-4 text-slate-500" />
                    <input
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      placeholder="대한민국 행정구역을 입력하세요"
                    />
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    검색 결과는 입력값에 맞춰 목록으로 노출됩니다.
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <LocationPinIcon className="h-4 w-4 text-slate-600" />
                      현재 위치
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      위치 권한을 허용하면 현재 위치의 날씨를 보여줍니다.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
                  현재 위치 날씨가 여기에 표시됩니다.
                </div>
              </div>
            </section>

            <aside className="lg:col-span-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <StarIcon className="h-4 w-4 text-slate-600" />
                    즐겨찾기
                  </div>
                  <span className="text-xs font-medium text-slate-500">0 / 6</span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  검색한 장소를 즐겨찾기에 추가하면 빠르게 확인할 수 있어요.
                </p>

                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
                  아직 즐겨찾기가 없습니다.
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

